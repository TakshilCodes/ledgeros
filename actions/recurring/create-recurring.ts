"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BillingCycle, RecurringCategory } from "@/app/generated/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteCacheByPattern } from "@/lib/cache";

const CreateRecurringSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be less than 80 characters"),

  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(1_000_000, "Amount is too large"),

  category: z.nativeEnum(RecurringCategory, {
    error: "Invalid category",
  }),

  billingCycle: z.nativeEnum(BillingCycle, {
    error: "Invalid billing cycle",
  }),

  nextDueDate: z.date({
    error: "Next due date is required",
  }),

  note: z
    .string()
    .trim()
    .max(250, "Note must be less than 250 characters")
    .optional()
    .nullable(),

  isActive: z.boolean().default(true),
});

type CreateRecurringInput = z.infer<typeof CreateRecurringSchema>;

function getMaxAllowedDueDate(billingCycle: BillingCycle) {
  const maxDate = new Date();

  if (billingCycle === "MONTHLY") maxDate.setMonth(maxDate.getMonth() + 2);
  if (billingCycle === "QUARTERLY") maxDate.setMonth(maxDate.getMonth() + 4);
  if (billingCycle === "HALF_YEARLY") maxDate.setMonth(maxDate.getMonth() + 7);
  if (billingCycle === "YEARLY") maxDate.setMonth(maxDate.getMonth() + 13);

  maxDate.setHours(23, 59, 59, 999);

  return maxDate;
}

export async function createRecurring(data: CreateRecurringInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        ok: false,
        msg: null,
        error: "Unauthorized",
      };
    }

    const valid = CreateRecurringSchema.safeParse(data);

    if (!valid.success) {
      return {
        ok: false,
        msg: null,
        error: valid.error.issues[0]?.message || "Invalid data",
      };
    }

    const {
      name,
      amount,
      category,
      billingCycle,
      nextDueDate,
      note,
      isActive,
    } = valid.data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(nextDueDate);
    dueDate.setHours(12, 0, 0, 0);

    if (dueDate < today) {
      return {
        ok: false,
        msg: null,
        error: "Next due date cannot be in the past",
      };
    }

    const maxAllowedDate = getMaxAllowedDueDate(billingCycle);

    if (dueDate > maxAllowedDate) {
      return {
        ok: false,
        msg: null,
        error: "Next due date is too far for the selected billing cycle",
      };
    }

    await prisma.recurringExpense.create({
      data: {
        userId: session.user.id,
        name,
        amount,
        category,
        billingCycle,
        nextDueDate: dueDate,
        note: note || null,
        isActive,
      },
    });

    await deleteCacheByPattern(`dashboard:${session.user.id}:*`);
    await deleteCacheByPattern(`insights:${session.user.id}:*`);

    revalidatePath("/dashboard/recurring");
    revalidatePath("/dashboard");

    return {
      ok: true,
      msg: "Recurring expense created successfully",
      error: null,
    };
  } catch (error) {
    console.error("CREATE_RECURRING_ERROR", error);

    return {
      ok: false,
      msg: null,
      error: "Something went wrong",
    };
  }
}