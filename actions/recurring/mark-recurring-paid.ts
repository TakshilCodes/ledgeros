"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ExpenseCategory } from "@/app/generated/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MarkRecurringPaidSchema = z.object({
    id: z.string().min(1, "Recurring expense ID is required"),
});

type MarkRecurringPaidInput = z.infer<typeof MarkRecurringPaidSchema>;

function getNextDueDate(currentDate: Date, billingCycle: string) {
    const nextDate = new Date(currentDate);

    if (billingCycle === "MONTHLY") {
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    if (billingCycle === "QUARTERLY") {
        nextDate.setMonth(nextDate.getMonth() + 3);
    }

    if (billingCycle === "HALF_YEARLY") {
        nextDate.setMonth(nextDate.getMonth() + 6);
    }

    if (billingCycle === "YEARLY") {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    nextDate.setHours(12, 0, 0, 0);

    return nextDate;
}

function moveDueDateForwardUntilFuture(currentDueDate: Date, billingCycle: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextDate = new Date(currentDueDate);
    nextDate.setHours(12, 0, 0, 0);

    do {
        nextDate = getNextDueDate(nextDate, billingCycle);
    } while (nextDate <= today);

    return nextDate;
}

function subtractBillingCycle(date: Date, billingCycle: string) {
    const previousDate = new Date(date);

    if (billingCycle === "MONTHLY") {
        previousDate.setMonth(previousDate.getMonth() - 1);
    }

    if (billingCycle === "QUARTERLY") {
        previousDate.setMonth(previousDate.getMonth() - 3);
    }

    if (billingCycle === "HALF_YEARLY") {
        previousDate.setMonth(previousDate.getMonth() - 6);
    }

    if (billingCycle === "YEARLY") {
        previousDate.setFullYear(previousDate.getFullYear() - 1);
    }

    previousDate.setHours(0, 0, 0, 0);

    return previousDate;
}

export async function markRecurringPaid(data: MarkRecurringPaidInput) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return {
                ok: false,
                msg: null,
                error: "Unauthorized",
                updatedRecurring: null,
            };
        }

        const valid = MarkRecurringPaidSchema.safeParse(data);

        if (!valid.success) {
            return {
                ok: false,
                msg: null,
                error: valid.error.issues[0]?.message || "Invalid data",
                updatedRecurring: null,
            };
        }

        const recurringExpense = await prisma.recurringExpense.findFirst({
            where: {
                id: valid.data.id,
                userId: session.user.id,
            },
            select: {
                id: true,
                name: true,
                amount: true,
                billingCycle: true,
                nextDueDate: true,
                note: true,
                isActive: true,
            },
        });

        if (!recurringExpense) {
            return {
                ok: false,
                msg: null,
                error: "Recurring expense not found",
                updatedRecurring: null,
            };
        }

        if (!recurringExpense.isActive) {
            return {
                ok: false,
                msg: null,
                error: "Inactive recurring expense cannot be marked as paid",
                updatedRecurring: null,
            };
        }

        const nextDueDate = moveDueDateForwardUntilFuture(
            recurringExpense.nextDueDate,
            recurringExpense.billingCycle
        );

        const today = new Date();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const dueDateStart = new Date(recurringExpense.nextDueDate);
        dueDateStart.setHours(0, 0, 0, 0);

        const cycleStartDate = subtractBillingCycle(
            dueDateStart,
            recurringExpense.billingCycle
        );

        if (todayStart < cycleStartDate) {
            return {
                ok: false,
                msg: null,
                error: "You can mark this as paid only when its billing cycle starts",
                updatedRecurring: null,
            };
        }

        const [, updatedRecurring] = await prisma.$transaction([
            prisma.expense.create({
                data: {
                    userId: session.user.id,
                    name: recurringExpense.name,
                    amount: recurringExpense.amount,
                    category: ExpenseCategory.OTHER,
                    note: recurringExpense.note || "Created from recurring expense",
                    spentAt: today,
                },
            }),

            prisma.recurringExpense.update({
                where: {
                    id: recurringExpense.id,
                },
                data: {
                    nextDueDate,
                },
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
            }),
        ]);

        revalidatePath("/dashboard/recurring");
        revalidatePath("/dashboard/expenses");
        revalidatePath("/dashboard");

        return {
            ok: true,
            msg: "Recurring expense marked as paid",
            error: null,
            updatedRecurring: {
                id: updatedRecurring.id,
                name: updatedRecurring.name,
                amount: Number(updatedRecurring.amount),
                category: updatedRecurring.category,
                billingCycle: updatedRecurring.billingCycle,
                nextDueDate: updatedRecurring.nextDueDate.toISOString(),
                note: updatedRecurring.note,
                isActive: updatedRecurring.isActive,
            },
        };
    } catch (error) {
        console.error("MARK_RECURRING_PAID_ERROR", error);

        return {
            ok: false,
            msg: null,
            error: "Something went wrong",
            updatedRecurring: null,
        };
    }
}