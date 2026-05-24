"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { AddExpenseZod } from "@/lib/validators/addexpense";
import { deleteCacheByPattern } from "@/lib/cache";

export async function updateExpense(id: string, data: unknown) {
  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user.id;

    if (!userId) {
      return {
        ok: false,
        error: "Unauthenticated",
      };
    }

    const valid = AddExpenseZod.safeParse(data);

    if (!valid.success) {
      return {
        ok: false,
        error: "Invalid data",
      };
    }

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingExpense) {
      return {
        ok: false,
        error: "Expense not found",
      };
    }

    await prisma.expense.update({
      where: {
        id,
      },
      data: {
        name: valid.data.name,
        amount: valid.data.amount,
        category: valid.data.category,
        note: valid.data.note,
        spentAt: valid.data.spentAt,
      },
    });

    await deleteCacheByPattern(`dashboard:${userId}:*`);
    await deleteCacheByPattern(`insights:${userId}:*`);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");

    return {
      ok: true,
      error: null,
    };
  } catch {
    return {
      ok: false,
      error: "Something went wrong",
    };
  }
}