"use server";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getCache, setCache } from "@/lib/cache";
import { DashboardData } from "@/types/dashboard";

type GetDashboardInput = {
  month?: number;
  year?: number;
};

function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function getMonthDateRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
}

function getTodayDateRange() {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
}

function getYesterdayDateRange() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
}

function getPreviousMonthDateRange(month: number, year: number) {
  let previousMonth = month - 1;
  let previousYear = year;

  if (previousMonth === 0) {
    previousMonth = 12;
    previousYear = year - 1;
  }

  return getMonthDateRange(previousMonth, previousYear);
}

function getStartOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  return start;
}

function getCurrentWeekDateRange() {
  const today = new Date();
  const day = today.getDay(); // Sunday = 0, Monday = 1

  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    weekStartDate: monday,
    weekEndDate: sunday,
  };
}

function getWeekDays(weekStartDate: Date) {
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return dayLabels.map((label, index) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + index);
    date.setHours(0, 0, 0, 0);

    return {
      label,
      date,
      dateKey: date.toISOString().split("T")[0],
    };
  });
}

function getMonthlyAmount(amount: number, billingCycle: string) {
  if (billingCycle === "MONTHLY") return amount;
  if (billingCycle === "QUARTERLY") return amount / 3;
  if (billingCycle === "HALF_YEARLY") return amount / 6;
  if (billingCycle === "YEARLY") return amount / 12;

  return amount;
}

function formatCategory(category: string) {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatCurrency(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function getDaysLeftText(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const differenceInMs = targetDate.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

  if (differenceInDays === 0) return "Today";
  if (differenceInDays === 1) return "Tomorrow";
  if (differenceInDays < 0) return "Overdue";

  return `In ${differenceInDays} days`;
}

export async function getDashboardData(input?: GetDashboardInput) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return {
        ok: false,
        error: "Unauthorized",
        data: null,
      };
    }

    const currentMonthYear = getCurrentMonthYear();

    const month = Number(input?.month || currentMonthYear.month);
    const year = Number(input?.year || currentMonthYear.year);

    if (!month || month < 1 || month > 12) {
      return {
        ok: false,
        error: "Invalid month",
        data: null,
      };
    }

    if (!year || year < 2020 || year > 2100) {
      return {
        ok: false,
        error: "Invalid year",
        data: null,
      };
    }

    const cacheKey = `dashboard:${userId}:${month}:${year}`;

    const cachedDashboard = await getCache<DashboardData>(cacheKey);

    if (cachedDashboard) {
      return {
        ok: true,
        error: null,
        data: cachedDashboard,
      };
    }

    const { startDate: monthStartDate, endDate: monthEndDate } =
      getMonthDateRange(month, year);

    const { startDate: todayStartDate, endDate: todayEndDate } =
      getTodayDateRange();

    const { startDate: yesterdayStartDate, endDate: yesterdayEndDate } =
      getYesterdayDateRange();

    const {
      startDate: previousMonthStartDate,
      endDate: previousMonthEndDate,
    } = getPreviousMonthDateRange(month, year);

    const { weekStartDate, weekEndDate } = getCurrentWeekDateRange();

    const [
      todaySpendResult,
      yesterdaySpendResult,
      monthSpendResult,
      previousMonthSpendResult,
      expenseCount,
      recentExpenses,
      categoryGroups,
      activeSubscriptions,
      upcomingRenewals,
      budgets,
      weeklyExpenses,
    ] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          userId,
          spentAt: {
            gte: todayStartDate,
            lte: todayEndDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.expense.aggregate({
        where: {
          userId,
          spentAt: {
            gte: yesterdayStartDate,
            lte: yesterdayEndDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.expense.aggregate({
        where: {
          userId,
          spentAt: {
            gte: monthStartDate,
            lte: monthEndDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.expense.aggregate({
        where: {
          userId,
          spentAt: {
            gte: previousMonthStartDate,
            lte: previousMonthEndDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.expense.count({
        where: {
          userId,
          spentAt: {
            gte: monthStartDate,
            lte: monthEndDate,
          },
        },
      }),

      prisma.expense.findMany({
        where: {
          userId,
          spentAt: {
            gte: monthStartDate,
            lte: monthEndDate,
          },
        },
        select: {
          id: true,
          name: true,
          category: true,
          amount: true,
          spentAt: true,
        },
        orderBy: {
          spentAt: "desc",
        },
        take: 4,
      }),

      prisma.expense.groupBy({
        by: ["category"],
        where: {
          userId,
          spentAt: {
            gte: monthStartDate,
            lte: monthEndDate,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
      }),

      prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          planName: true,
          category: true,
          amount: true,
          billingCycle: true,
          nextRenewalDate: true,
        },
      }),

      prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
          nextRenewalDate: {
            gte: todayStartDate,
          },
        },
        select: {
          id: true,
          name: true,
          planName: true,
          amount: true,
          billingCycle: true,
          nextRenewalDate: true,
        },
        orderBy: {
          nextRenewalDate: "asc",
        },
        take: 4,
      }),

      prisma.budget.findMany({
        where: {
          userId,
          month,
          year,
        },
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
          amount: true,
        },
      }),

      prisma.expense.findMany({
        where: {
          userId,
          spentAt: {
            gte: weekStartDate,
            lte: weekEndDate,
          },
        },
        select: {
          spentAt: true,
        },
      }),
    ]);

    const todaySpend = Number(todaySpendResult._sum.amount || 0);
    const yesterdaySpend = Number(yesterdaySpendResult._sum.amount || 0);
    const thisMonthSpend = Number(monthSpendResult._sum.amount || 0);
    const previousMonthSpend = Number(previousMonthSpendResult._sum.amount || 0);

    const subscriptionsMonthlyTotal = activeSubscriptions.reduce(
      (total, subscription) => {
        return (
          total +
          getMonthlyAmount(
            Number(subscription.amount),
            subscription.billingCycle
          )
        );
      },
      0
    );

    const monthlyBudget = budgets.find((budget) => budget.type === "MONTHLY");
    const dailyLimitBudget = budgets.find(
      (budget) => budget.type === "DAILY_LIMIT"
    );

    const monthlyBudgetAmount = monthlyBudget
      ? Number(monthlyBudget.amount)
      : 0;

    const budgetLeft = monthlyBudgetAmount - thisMonthSpend;

    const budgetUsedPercentage =
      monthlyBudgetAmount > 0
        ? Math.round((thisMonthSpend / monthlyBudgetAmount) * 100)
        : 0;

    const topCategoryGroup = categoryGroups[0] || null;

    const topCategory = topCategoryGroup
      ? {
        category: topCategoryGroup.category,
        label: formatCategory(topCategoryGroup.category),
        amount: Number(topCategoryGroup._sum.amount || 0),
      }
      : null;

    const categoryBreakdown = categoryGroups.map((group) => {
      const amount = Number(group._sum.amount || 0);

      return {
        category: group.category,
        label: formatCategory(group.category),
        amount,
        percentage:
          thisMonthSpend > 0 ? Math.round((amount / thisMonthSpend) * 100) : 0,
      };
    });

    const categorySpentMap = new Map<string, number>();

    categoryBreakdown.forEach((category) => {
      categorySpentMap.set(category.category, category.amount);
    });

    const categoryBudgets = budgets
      .filter((budget) => budget.type === "CATEGORY" && budget.category)
      .map((budget) => {
        const amount = Number(budget.amount);
        const spent = categorySpentMap.get(budget.category || "") || 0;

        return {
          id: budget.id,
          name:
            budget.name ||
            `${formatCategory(budget.category || "OTHER")} Budget`,
          category: budget.category,
          label: formatCategory(budget.category || "OTHER"),
          amount,
          spent,
          remaining: amount - spent,
          usedPercentage: amount > 0 ? Math.round((spent / amount) * 100) : 0,
        };
      })
      .slice(0, 3);

    const dailyLimitAmount = dailyLimitBudget
      ? Number(dailyLimitBudget.amount)
      : 0;

    let alert:
      | {
        type: "success" | "warning" | "danger" | "info";
        title: string;
        message: string;
      }
      | null = null;

    if (dailyLimitAmount > 0) {
      const dailyUsedPercentage = Math.round(
        (todaySpend / dailyLimitAmount) * 100
      );

      if (dailyUsedPercentage >= 100) {
        alert = {
          type: "danger",
          title: "Daily limit exceeded",
          message: `You've spent ${formatCurrency(
            todaySpend
          )} today. You are over your daily limit of ${formatCurrency(
            dailyLimitAmount
          )}.`,
        };
      } else if (dailyUsedPercentage >= 80) {
        alert = {
          type: "warning",
          title: "Close to daily limit",
          message: `You've spent ${formatCurrency(
            todaySpend
          )} today. You're close to your daily limit of ${formatCurrency(
            dailyLimitAmount
          )}.`,
        };
      }
    }

    if (!alert && budgetUsedPercentage >= 100) {
      alert = {
        type: "danger",
        title: "Monthly budget exceeded",
        message: `You've spent ${formatCurrency(
          thisMonthSpend
        )} this month and exceeded your monthly budget.`,
      };
    }

    if (!alert && topCategory) {
      alert = {
        type: "info",
        title: "Top spending category",
        message: `${topCategory.label} is your highest spending category this month with ${formatCurrency(
          topCategory.amount
        )} spent.`,
      };
    }

    const weekDays = getWeekDays(weekStartDate);

    const expenseDateSet = new Set(
      weeklyExpenses.map((expense) => {
        return expense.spentAt.toISOString().split("T")[0];
      })
    );

    const today = getStartOfDay(new Date());

    const noSpendDays = weekDays.map((day) => {
      const dayStart = getStartOfDay(day.date);
      const isFuture = dayStart > today;
      const hasExpense = expenseDateSet.has(day.dateKey);

      return {
        label: day.label,
        date: day.date.toISOString(),
        isFuture,
        hasExpense,
        isNoSpendDay: !isFuture && !hasExpense,
      };
    });

    const noSpendStreak = noSpendDays.filter((day) => day.isNoSpendDay).length;

    const dashboardData: DashboardData = {
      month,
      year,
      summaryCards: {
        todaySpend: {
          title: "Today's Spend",
          value: todaySpend,
          formattedValue: formatCurrency(todaySpend),
          subtitle: `vs yesterday ${formatCurrency(yesterdaySpend)}`,
        },

        thisMonthSpend: {
          title: "This Month's Spend",
          value: thisMonthSpend,
          formattedValue: formatCurrency(thisMonthSpend),
          subtitle: `vs last month ${formatCurrency(previousMonthSpend)}`,
        },

        subscriptionsTotal: {
          title: "Subscriptions Total",
          value: Math.round(subscriptionsMonthlyTotal),
          formattedValue: `${formatCurrency(subscriptionsMonthlyTotal)} /month`,
          subtitle: `${activeSubscriptions.length} active`,
        },

        budgetLeft: {
          title: budgetLeft >= 0 ? "Budget Left" : "Over Budget",
          value: Math.abs(budgetLeft),
          formattedValue: formatCurrency(Math.abs(budgetLeft)),
          subtitle:
            monthlyBudgetAmount > 0
              ? `${budgetUsedPercentage}% of ${formatCurrency(monthlyBudgetAmount)} used`
              : "No monthly budget set",
          isOverBudget: budgetLeft < 0,
        },
      },

      alert,
      expenseOverview: {
        totalSpent: thisMonthSpend,
        categoryBreakdown,
      },
      recentExpenses: recentExpenses.map((expense) => ({
        id: expense.id,
        name: expense.name,
        category: expense.category,
        label: formatCategory(expense.category),
        amount: Number(expense.amount),
        formattedAmount: formatCurrency(Number(expense.amount)),
        spentAt: expense.spentAt.toISOString(),
      })),
      upcomingRenewals: upcomingRenewals.map((subscription) => ({
        id: subscription.id,
        name: subscription.name,
        planName: subscription.planName,
        amount: Number(subscription.amount),
        formattedAmount: formatCurrency(Number(subscription.amount)),
        billingCycle: subscription.billingCycle,
        nextRenewalDate: subscription.nextRenewalDate.toISOString(),
        due: getDaysLeftText(subscription.nextRenewalDate),
      })),
      categoryBudgets,
      noSpend: {
        streak: noSpendStreak,
        days: noSpendDays,
      },
      meta: {
        expenseCount,
        activeSubscriptionCount: activeSubscriptions.length,
        hasMonthlyBudget: Boolean(monthlyBudget),
        hasDailyLimit: Boolean(dailyLimitBudget),
      },
    };

    await setCache({
      key: cacheKey,
      value: dashboardData,
      ttlSeconds: 300,
    });

    return {
      ok: true,
      error: null,
      data: dashboardData,
    };
  } catch (error) {
    console.error("GET_DASHBOARD_DATA_ERROR", error);

    return {
      ok: false,
      error: "Something went wrong while fetching dashboard data",
      data: null,
    };
  }
}