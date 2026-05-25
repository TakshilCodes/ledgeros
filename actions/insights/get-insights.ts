"use server";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getCache, setCache } from "@/lib/cache";

type GetInsightsInput = {
  month?: number;
  year?: number;
};

type InsightType = "success" | "warning" | "danger" | "info";

export type InsightsData = {
  month: number;
  year: number;

  summary: {
    totalSpent: number;
    highestCategory: {
      category: string;
      label: string;
      amount: number;
      percentage: number;
    } | null;
    activeSubscriptionMonthlyCost: number;
    recurringMonthlyCost: number;
    averageDailySpend: number;
    subscriptionShare: number;
    recurringShare: number;
  };

  categoryBreakdown: {
    category: string;
    label: string;
    amount: number;
    percentage: number;
  }[];

  budgetStatus: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    usedPercentage: number;
    isOverBudget: boolean;
  } | null;

  categoryBudgetStatus: {
    category: string;
    label: string;
    spent: number;
    budget: number | null;
    remaining: number | null;
    usedPercentage: number | null;
    isOverBudget: boolean;
  }[];

  upcomingSubscriptions: {
    id: string;
    name: string;
    amount: number;
    billingCycle: string;
    nextRenewalDate: string;
    category: string;
  }[];

  upcomingRecurringExpenses: {
    id: string;
    name: string;
    amount: number;
    category: string;
    billingCycle: string;
    nextDueDate: string;
  }[];

  recentExpenses: {
    id: string;
    name: string;
    amount: number;
    category: string;
    spentAt: string;
  }[];

  insights: {
    type: string;
    title: string;
    message: string;
  }[];
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

function getDaysPassedInMonth(month: number, year: number) {
  const now = new Date();

  const isCurrentMonth =
    now.getMonth() + 1 === month && now.getFullYear() === year;

  if (isCurrentMonth) {
    return now.getDate();
  }

  return new Date(year, month, 0).getDate();
}

function getMonthlySubscriptionAmount(amount: number, billingCycle: string) {
  if (billingCycle === "MONTHLY") return amount;
  if (billingCycle === "QUARTERLY") return amount / 3;
  if (billingCycle === "HALF_YEARLY") return amount / 6;
  if (billingCycle === "YEARLY") return amount / 12;

  return amount;
}

function getMonthlyRecurringAmount(amount: number, billingCycle: string) {
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

function createInsight(
  type: InsightType,
  title: string,
  message: string
) {
  return {
    type,
    title,
    message,
  };
}

export async function getInsights(input?: GetInsightsInput) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const INSIGHTS_CACHE_TTL = 60 * 10;

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

    const cacheKey = `insights:${userId}:${month}:${year}`;

    const cachedInsights = await getCache<InsightsData>(cacheKey);

    if (cachedInsights) {
      return {
        ok: true,
        error: null,
        data: cachedInsights,
      };
    }

    const { startDate, endDate } = getMonthDateRange(month, year);
    const daysPassed = getDaysPassedInMonth(month, year);

    const [
      monthlyExpenseTotal,
      categoryExpenseGroups,
      activeSubscriptions,
      activeRecurringExpenses,
      budgets,
      recentExpenses,
    ] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          userId,
          spentAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.expense.groupBy({
        by: ["category"],
        where: {
          userId,
          spentAt: {
            gte: startDate,
            lte: endDate,
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
          amount: true,
          billingCycle: true,
          nextRenewalDate: true,
          category: true,
        },
      }),

      prisma.recurringExpense.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          amount: true,
          billingCycle: true,
          nextDueDate: true,
          category: true,
        },
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
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          name: true,
          amount: true,
          category: true,
          spentAt: true,
        },
        orderBy: {
          spentAt: "desc",
        },
        take: 5,
      }),
    ]);

    const totalSpent = Number(monthlyExpenseTotal._sum.amount || 0);

    const categoryBreakdown = categoryExpenseGroups.map((group) => {
      const amount = Number(group._sum.amount || 0);

      return {
        category: group.category,
        label: formatCategory(group.category),
        amount,
        percentage:
          totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      };
    });

    const highestCategory = categoryBreakdown[0] || null;

    const activeSubscriptionMonthlyCost = activeSubscriptions.reduce(
      (total, subscription) => {
        return (
          total +
          getMonthlySubscriptionAmount(
            Number(subscription.amount),
            subscription.billingCycle
          )
        );
      },
      0
    );

    const recurringMonthlyCost = activeRecurringExpenses.reduce(
      (total, recurring) => {
        return (
          total +
          getMonthlyRecurringAmount(
            Number(recurring.amount),
            recurring.billingCycle
          )
        );
      },
      0
    );

    const monthlyBudget = budgets.find((budget) => budget.type === "MONTHLY");

    const monthlyBudgetAmount = monthlyBudget
      ? Number(monthlyBudget.amount)
      : 0;

    const budgetRemaining = monthlyBudgetAmount - totalSpent;

    const budgetUsedPercentage =
      monthlyBudgetAmount > 0
        ? Math.round((totalSpent / monthlyBudgetAmount) * 100)
        : 0;

    const budgetStatus = monthlyBudget
      ? {
        totalBudget: monthlyBudgetAmount,
        totalSpent,
        remaining: budgetRemaining,
        usedPercentage: budgetUsedPercentage,
        isOverBudget: budgetRemaining < 0,
      }
      : null;

    const categoryBudgetMap = new Map<
      string,
      {
        id: string;
        name: string;
        amount: number;
      }
    >();

    budgets.forEach((budget) => {
      if (budget.type === "CATEGORY" && budget.category) {
        categoryBudgetMap.set(budget.category, {
          id: budget.id,
          name: budget.name || `${formatCategory(budget.category)} Budget`,
          amount: Number(budget.amount),
        });
      }
    });

    const categoryBudgetStatus = categoryBreakdown.map((category) => {
      const budget = categoryBudgetMap.get(category.category);

      if (!budget) {
        return {
          category: category.category,
          label: category.label,
          spent: category.amount,
          budget: null,
          remaining: null,
          usedPercentage: null,
          isOverBudget: false,
        };
      }

      const remaining = budget.amount - category.amount;
      const usedPercentage =
        budget.amount > 0
          ? Math.round((category.amount / budget.amount) * 100)
          : 0;

      return {
        category: category.category,
        label: category.label,
        spent: category.amount,
        budget: budget.amount,
        remaining,
        usedPercentage,
        isOverBudget: remaining < 0,
      };
    });

    const averageDailySpend =
      daysPassed > 0 ? Math.round(totalSpent / daysPassed) : 0;

    const subscriptionShare =
      totalSpent > 0
        ? Math.round((activeSubscriptionMonthlyCost / totalSpent) * 100)
        : 0;

    const recurringShare =
      totalSpent > 0
        ? Math.round((recurringMonthlyCost / totalSpent) * 100)
        : 0;

    const insights = [];

    if (totalSpent === 0) {
      insights.push(
        createInsight(
          "info",
          "No expenses yet",
          "You have not added any expenses for this month."
        )
      );
    } else {
      insights.push(
        createInsight(
          "info",
          "Monthly spending",
          `You spent ${formatCurrency(totalSpent)} this month.`
        )
      );
    }

    if (highestCategory) {
      insights.push(
        createInsight(
          highestCategory.percentage >= 40 ? "warning" : "info",
          "Highest spending category",
          `${highestCategory.label} is your highest category with ${formatCurrency(
            highestCategory.amount
          )} spent.`
        )
      );
    }

    if (budgetStatus) {
      if (budgetStatus.isOverBudget) {
        insights.push(
          createInsight(
            "danger",
            "Over monthly budget",
            `You are over your monthly budget by ${formatCurrency(
              Math.abs(budgetStatus.remaining)
            )}.`
          )
        );
      } else if (budgetStatus.usedPercentage >= 90) {
        insights.push(
          createInsight(
            "warning",
            "Near monthly budget limit",
            `You have used ${budgetStatus.usedPercentage}% of your monthly budget.`
          )
        );
      } else {
        insights.push(
          createInsight(
            "success",
            "Budget looks healthy",
            `You still have ${formatCurrency(
              budgetStatus.remaining
            )} left in your monthly budget.`
          )
        );
      }
    } else {
      insights.push(
        createInsight(
          "info",
          "No monthly budget set",
          "Create a monthly budget to track whether your spending is under control."
        )
      );
    }

    const overBudgetCategories = categoryBudgetStatus.filter(
      (category) => category.isOverBudget
    );

    if (overBudgetCategories.length > 0) {
      const firstOverBudgetCategory = overBudgetCategories[0];

      insights.push(
        createInsight(
          "danger",
          "Category budget exceeded",
          `${firstOverBudgetCategory.label} is over budget by ${formatCurrency(
            Math.abs(firstOverBudgetCategory.remaining || 0)
          )}.`
        )
      );
    }

    if (activeSubscriptionMonthlyCost > 0) {
      insights.push(
        createInsight(
          subscriptionShare >= 20 ? "warning" : "info",
          "Subscription impact",
          `Your active subscriptions cost around ${formatCurrency(
            activeSubscriptionMonthlyCost
          )}/month.`
        )
      );
    }

    if (recurringMonthlyCost > 0) {
      insights.push(
        createInsight(
          recurringShare >= 40 ? "warning" : "info",
          "Recurring expense impact",
          `Your recurring expenses add up to around ${formatCurrency(
            recurringMonthlyCost
          )}/month.`
        )
      );
    }

    if (averageDailySpend > 0) {
      insights.push(
        createInsight(
          "info",
          "Average daily spending",
          `Your average daily spending this month is ${formatCurrency(
            averageDailySpend
          )}.`
        )
      );
    }

    const upcomingSubscriptions = activeSubscriptions
      .filter((subscription) => {
        const renewalDate = new Date(subscription.nextRenewalDate);

        return renewalDate >= new Date();
      })
      .sort(
        (a, b) =>
          new Date(a.nextRenewalDate).getTime() -
          new Date(b.nextRenewalDate).getTime()
      )
      .slice(0, 5)
      .map((subscription) => ({
        id: subscription.id,
        name: subscription.name,
        amount: Number(subscription.amount),
        billingCycle: subscription.billingCycle,
        nextRenewalDate: subscription.nextRenewalDate.toISOString(),
        category: subscription.category,
      }));

    const upcomingRecurringExpenses = activeRecurringExpenses
      .filter((recurring) => {
        const dueDate = new Date(recurring.nextDueDate);

        return dueDate >= new Date();
      })
      .sort(
        (a, b) =>
          new Date(a.nextDueDate).getTime() -
          new Date(b.nextDueDate).getTime()
      )
      .slice(0, 5)
      .map((recurring) => ({
        id: recurring.id,
        name: recurring.name,
        amount: Number(recurring.amount),
        billingCycle: recurring.billingCycle,
        nextDueDate: recurring.nextDueDate.toISOString(),
        category: recurring.category,
      }));

    const insightsData: InsightsData = {
      month,
      year,

      summary: {
        totalSpent,
        highestCategory,
        activeSubscriptionMonthlyCost: Math.round(activeSubscriptionMonthlyCost),
        recurringMonthlyCost: Math.round(recurringMonthlyCost),
        averageDailySpend,
        subscriptionShare,
        recurringShare,
      },

      categoryBreakdown,

      budgetStatus,
      categoryBudgetStatus,

      upcomingSubscriptions,
      upcomingRecurringExpenses,

      recentExpenses: recentExpenses.map((expense) => ({
        id: expense.id,
        name: expense.name,
        amount: Number(expense.amount),
        category: expense.category,
        spentAt: expense.spentAt.toISOString(),
      })),

      insights,
    };

    await setCache({
      key: cacheKey,
      value: insightsData,
      ttlSeconds: INSIGHTS_CACHE_TTL,
    });

    return {
      ok: true,
      error: null,
      data: insightsData,
    };
  } catch (error) {
    console.error("GET_INSIGHTS_ERROR", error);

    return {
      ok: false,
      error: "Something went wrong while fetching insights",
      data: null,
    };
  }
}