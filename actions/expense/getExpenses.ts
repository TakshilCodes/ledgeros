"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
    endOfMonth,
    endOfToday,
    startOfMonth,
    startOfToday,
} from "date-fns";
import { getServerSession } from "next-auth";
import { ExpenseCategory } from "@/app/generated/prisma/client";

type GetExpensesParams = {
    cursor?: string;
    search?: string;
    category?: string;
    date?: string;
    sort?: string;
};

export async function getExpenseStats() {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
        return {
            thisMonth: 0,
            today: 0,
            totalExpenses: 0,
            topCategory: "None",
        };
    }

    const startMonth = startOfMonth(new Date());
    const endMonth = endOfMonth(new Date());

    const startTodayDate = startOfToday();
    const endTodayDate = endOfToday();

    const [thisMonthTotal, todayTotal, totalExpenses, topCategory] =
        await Promise.all([
            prisma.expense.aggregate({
                where: {
                    userId,
                    spentAt: {
                        gte: startMonth,
                        lte: endMonth,
                    },
                },
                _sum: { amount: true },
            }),

            prisma.expense.aggregate({
                where: {
                    userId,
                    spentAt: {
                        gte: startTodayDate,
                        lte: endTodayDate,
                    },
                },
                _sum: { amount: true },
            }),

            prisma.expense.count({
                where: { userId },
            }),

            prisma.expense.groupBy({
                by: ["category"],
                where: {
                    userId,
                    spentAt: {
                        gte: startMonth,
                        lte: endMonth,
                    },
                },
                _sum: { amount: true },
                orderBy: {
                    _sum: {
                        amount: "desc",
                    },
                },
                take: 1,
            }),
        ]);

    return {
        thisMonth: Number(thisMonthTotal._sum.amount || 0),
        today: Number(todayTotal._sum.amount || 0),
        totalExpenses,
        topCategory: topCategory[0]?.category || "None",
    };
}

export async function getExpenses(params: GetExpensesParams = {}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return {
            expenses: [],
            nextCursor: null,
        };
    }

    const { cursor, search, category, date, sort } = params;

    const where: any = {
        userId: session.user.id,
    };

    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                note: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (category && category !== "ALL") {
        where.category = category as ExpenseCategory;
    }

    if (date === "today") {
        where.spentAt = {
            gte: startOfToday(),
            lte: endOfToday(),
        };
    }

    if (date === "this-month") {
        where.spentAt = {
            gte: startOfMonth(new Date()),
            lte: endOfMonth(new Date()),
        };
    }

    const orderBy =
        sort === "oldest"
            ? { spentAt: "asc" as const }
            : sort === "highest"
                ? { amount: "desc" as const }
                : sort === "lowest"
                    ? { amount: "asc" as const }
                    : { spentAt: "desc" as const };

    const expenses = await prisma.expense.findMany({
        where,
        orderBy,
        take: 20,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
    });

    const nextCursor = expenses.length === 20 ? expenses[expenses.length - 1].id : null;

    return {
        expenses: expenses.map((expense) => ({
            id: expense.id,
            name: expense.name,
            amount: Number(expense.amount),
            category: expense.category,
            note: expense.note,
            spentAt: expense.spentAt,
        })),
        nextCursor,
    };
}