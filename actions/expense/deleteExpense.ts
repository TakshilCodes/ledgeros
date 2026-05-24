"use server";

import { authOptions } from "@/lib/auth";
import { deleteCacheByPattern } from "@/lib/cache";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

export async function deleteExpense(id: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        ok: false,
        error: "Unauthenticated",
      };
    }

    const userId = session.user.id;

    await prisma.expense.delete({
      where: {
        id,
        userId,
      },
    });

    await deleteCacheByPattern(`dashboard:${userId}:*`);
    await deleteCacheByPattern(`insights:${userId}:*`);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");

    return {
      ok: true,
    };
  } catch {
    return {
      ok: false,
      error: "Something went wrong",
    };
  }
}