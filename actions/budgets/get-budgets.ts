"use server";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { ExpenseCategory } from "@/app/generated/prisma/client";

type GetBudgetsInput = {
  month?: number;
  year?: number;
  type?: "ALL" | "MONTHLY" | "CATEGORY" | "DAILY_LIMIT";
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

function getDaysLeftInMonth(month: number, year: number) {
  const now = new Date();

  const isCurrentMonth =
    now.getMonth() + 1 === month && now.getFullYear() === year;

  if (!isCurrentMonth) {
    return 0;
  }

  const lastDayOfMonth = new Date(year, month, 0).getDate();

  return lastDayOfMonth - now.getDate() + 1;
}

function calculateBudgetStatus(spent: number, amount: number) {
  if (amount <= 0) return "HEALTHY";

  const percentage = Math.round((spent / amount) * 100);

  if (percentage >= 100) return "OVER_BUDGET";
  if (percentage >= 90) return "NEAR_LIMIT";
  if (percentage >= 70) return "WATCH";

  return "HEALTHY";
}

function getBudgetInsight({
  name,
  spent,
  amount,
}: {
  name: string;
  spent: number;
  amount: number;
}) {
  if (amount <= 0) {
    return `${name} does not have a valid budget amount.`;
  }

  const percentage = Math.round((spent / amount) * 100);
  const remaining = amount - spent;

  if (percentage >= 100) {
    return `${name} is over budget by ₹${Math.abs(remaining).toLocaleString(
      "en-IN"
    )}.`;
  }

  if (percentage >= 90) {
    return `${name} is close to the limit. You have used ${percentage}% of this budget.`;
  }

  if (percentage >= 70) {
    return `${name} has used ${percentage}% of its budget. Keep an eye on spending.`;
  }

  return `${name} looks healthy. You still have ₹${remaining.toLocaleString(
    "en-IN"
  )} left.`;
}

export async function getBudgets(input?: GetBudgetsInput) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return {
        ok: false,
        error: "Unauthorized",
        budgets: [],
        stats: null,
      };
    }

    const currentMonthYear = getCurrentMonthYear();

    const month = Number(input?.month || currentMonthYear.month);
    const year = Number(input?.year || currentMonthYear.year);
    const type = input?.type || "ALL";

    if (!month || month < 1 || month > 12) {
      return {
        ok: false,
        error: "Invalid month",
        budgets: [],
        stats: null,
      };
    }

    if (!year || year < 2020 || year > 2100) {
      return {
        ok: false,
        error: "Invalid year",
        budgets: [],
        stats: null,
      };
    }

    const { startDate, endDate } = getMonthDateRange(month, year);
    const { startDate: todayStartDate, endDate: todayEndDate } =
      getTodayDateRange();

    const budgetWhere = {
      userId,
      month,
      year,
      ...(type !== "ALL" ? { type } : {}),
    };

    const budgets = await prisma.budget.findMany({
      where: budgetWhere,
      orderBy: [
        {
          type: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        amount: true,
        month: true,
        year: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const monthlyExpenseTotal = await prisma.expense.aggregate({
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
    });

    const todayExpenseTotal = await prisma.expense.aggregate({
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
    });

    const categoryBudgets = budgets.filter(
      (budget) => budget.type === "CATEGORY" && budget.category
    );

    const categories = categoryBudgets
      .map((budget) => budget.category)
      .filter(Boolean) as ExpenseCategory[];

    const categoryExpenseGroups =
      categories.length > 0
        ? await prisma.expense.groupBy({
            by: ["category"],
            where: {
              userId,
              category: {
                in: categories,
              },
              spentAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: {
              amount: true,
            },
          })
        : [];

    const categorySpentMap = new Map<string, number>();

    categoryExpenseGroups.forEach((group) => {
      categorySpentMap.set(group.category, Number(group._sum.amount || 0));
    });

    const monthlySpent = Number(monthlyExpenseTotal._sum.amount || 0);
    const todaySpent = Number(todayExpenseTotal._sum.amount || 0);

    const budgetsWithSpent = budgets.map((budget) => {
      const amount = Number(budget.amount);

      let spent = 0;

      if (budget.type === "MONTHLY") {
        spent = monthlySpent;
      }

      if (budget.type === "CATEGORY" && budget.category) {
        spent = categorySpentMap.get(budget.category) || 0;
      }

      if (budget.type === "DAILY_LIMIT") {
        spent = todaySpent;
      }

      const remaining = amount - spent;
      const usedPercentage =
        amount > 0 ? Math.round((spent / amount) * 100) : 0;

      const name =
        budget.name ||
        (budget.type === "MONTHLY"
          ? "Monthly Budget"
          : budget.type === "DAILY_LIMIT"
            ? "Daily Spending Limit"
            : `${budget.category} Budget`);

      return {
        id: budget.id,
        name,
        type: budget.type,
        category: budget.category,
        amount,
        spent,
        remaining,
        usedPercentage,
        status: calculateBudgetStatus(spent, amount),
        insight: getBudgetInsight({
          name,
          spent,
          amount,
        }),
        month: budget.month,
        year: budget.year,
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString(),
      };
    });

    const totalBudget = budgetsWithSpent.reduce((total, budget) => {
      if (budget.type === "DAILY_LIMIT") return total;

      return total + budget.amount;
    }, 0);

    const totalSpent = budgetsWithSpent.reduce((total, budget) => {
      if (budget.type === "DAILY_LIMIT") return total;

      return total + budget.spent;
    }, 0);

    const totalRemaining = totalBudget - totalSpent;
    const budgetHealth =
      totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const monthlyBudget = budgetsWithSpent.find(
      (budget) => budget.type === "MONTHLY"
    );

    const daysLeft = getDaysLeftInMonth(month, year);

    const safeDailySpend =
      monthlyBudget && daysLeft > 0 && monthlyBudget.remaining > 0
        ? Math.floor(monthlyBudget.remaining / daysLeft)
        : 0;

    return {
      ok: true,
      error: null,
      budgets: budgetsWithSpent,
      stats: {
        totalBudget,
        totalSpent,
        totalRemaining,
        budgetHealth,
        safeDailySpend,
        daysLeft,
        month,
        year,
      },
    };
  } catch (error) {
    console.error("GET_BUDGETS_ERROR", error);

    return {
      ok: false,
      error: "Something went wrong while fetching budgets",
      budgets: [],
      stats: null,
    };
  }
}