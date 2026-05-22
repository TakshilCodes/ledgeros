"use server";

import prisma from "@/lib/prisma";
import { BillingCycle, Prisma, RecurringCategory } from "@/app/generated/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type GetRecurringFilters = {
  search?: string;
  status?: string;
  category?: string;
  cycle?: string;
  type?: string;
  cursor?: string | null;
};

export type RecurringExpenseItem = {
  id: string;
  name: string;
  amount: number;
  category: RecurringCategory;
  billingCycle: BillingCycle;
  nextDueDate: string;
  note: string | null;
  isActive: boolean;
};

export type RecurringStats = {
  monthlyTotal: number;
  yearlyEstimate: number;
  activeRecurring: number;
  totalRecurring: number;
  upcomingDue: {
    name: string;
    date: string;
  } | null;
};

function getMonthlyValue(amount: number, billingCycle: BillingCycle) {
  if (billingCycle === "MONTHLY") return amount;
  if (billingCycle === "QUARTERLY") return amount / 3;
  if (billingCycle === "HALF_YEARLY") return amount / 6;
  if (billingCycle === "YEARLY") return amount / 12;

  return amount;
}

function getYearlyValue(amount: number, billingCycle: BillingCycle) {
  if (billingCycle === "MONTHLY") return amount * 12;
  if (billingCycle === "QUARTERLY") return amount * 4;
  if (billingCycle === "HALF_YEARLY") return amount * 2;
  if (billingCycle === "YEARLY") return amount;

  return amount;
}

export async function getRecurringStats() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        ok: false,
        stats: null,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    const [activeRecurring, totalRecurring, activeRecurringExpenses, upcomingDue] =
      await Promise.all([
        prisma.recurringExpense.count({
          where: {
            userId,
            isActive: true,
          },
        }),

        prisma.recurringExpense.count({
          where: {
            userId,
          },
        }),

        prisma.recurringExpense.findMany({
          where: {
            userId,
            isActive: true,
          },
          select: {
            amount: true,
            billingCycle: true,
          },
        }),

        prisma.recurringExpense.findFirst({
          where: {
            userId,
            isActive: true,
            nextDueDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            nextDueDate: "asc",
          },
          select: {
            name: true,
            nextDueDate: true,
          },
        }),
      ]);

    const monthlyTotal = activeRecurringExpenses.reduce((total, item) => {
      return total + getMonthlyValue(Number(item.amount), item.billingCycle);
    }, 0);

    const yearlyEstimate = activeRecurringExpenses.reduce((total, item) => {
      return total + getYearlyValue(Number(item.amount), item.billingCycle);
    }, 0);

    return {
      ok: true,
      stats: {
        monthlyTotal,
        yearlyEstimate,
        activeRecurring,
        totalRecurring,
        upcomingDue: upcomingDue
          ? {
              name: upcomingDue.name,
              date: upcomingDue.nextDueDate.toISOString(),
            }
          : null,
      } satisfies RecurringStats,
      error: null,
    };
  } catch (error) {
    console.error("GET_RECURRING_STATS_ERROR", error);

    return {
      ok: false,
      stats: null,
      error: "Something went wrong",
    };
  }
}

export async function getRecurring(filters: GetRecurringFilters = {}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        ok: false,
        recurringExpenses: [],
        nextCursor: null,
        error: "Unauthorized",
      };
    }

    const {
      search,
      status,
      category,
      cycle,
      type,
      cursor,
    } = filters;

    const where: Prisma.RecurringExpenseWhereInput = {
      userId: session.user.id,
    };

    if (search?.trim()) {
      const searchValue = search.trim();

      where.OR = [
        {
          name: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
        {
          note: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status === "ACTIVE") {
      where.isActive = true;
    }

    if (status === "INACTIVE") {
      where.isActive = false;
    }

    if (
      category &&
      Object.values(RecurringCategory).includes(category as RecurringCategory)
    ) {
      where.category = category as RecurringCategory;
    }

    if (
      cycle &&
      Object.values(BillingCycle).includes(cycle as BillingCycle)
    ) {
      where.billingCycle = cycle as BillingCycle;
    }

    if (type === "DUE_SOON") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const next7Days = new Date(today);
      next7Days.setDate(today.getDate() + 7);
      next7Days.setHours(23, 59, 59, 999);

      where.nextDueDate = {
        gte: today,
        lte: next7Days,
      };

      where.isActive = true;
    }

    if (type === "OVERDUE") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      where.nextDueDate = {
        lt: today,
      };

      where.isActive = true;
    }

    const take = 20;

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where,
      take: take + 1,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
      orderBy: [
        {
          nextDueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        amount: true,
        category: true,
        billingCycle: true,
        nextDueDate: true,
        note: true,
        isActive: true,
      },
    });

    let nextCursor: string | null = null;

    if (recurringExpenses.length > take) {
      const nextItem = recurringExpenses.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      ok: true,
      recurringExpenses: recurringExpenses.map((item) => ({
        id: item.id,
        name: item.name,
        amount: Number(item.amount),
        category: item.category,
        billingCycle: item.billingCycle,
        nextDueDate: item.nextDueDate.toISOString(),
        note: item.note,
        isActive: item.isActive,
      })) satisfies RecurringExpenseItem[],
      nextCursor,
      error: null,
    };
  } catch (error) {
    console.error("GET_RECURRING_ERROR", error);

    return {
      ok: false,
      recurringExpenses: [],
      nextCursor: null,
      error: "Something went wrong",
    };
  }
}