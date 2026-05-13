"use server";

import { authOptions } from "@/lib/auth";
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

    await prisma.expense.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

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