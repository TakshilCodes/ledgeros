"use server";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function deleteBudget(id: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return {
        ok: false,
        message: null,
        error: "Unauthorized",
      };
    }

    if (!id) {
      return {
        ok: false,
        message: null,
        error: "Budget id is required",
      };
    }

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!budget) {
      return {
        ok: false,
        message: null,
        error: "Budget not found",
      };
    }

    await prisma.budget.delete({
      where: {
        id: budget.id,
      },
    });

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: "Budget deleted successfully",
      error: null,
    };
  } catch (error) {
    console.error("DELETE_BUDGET_ERROR", error);

    return {
      ok: false,
      message: null,
      error: "Something went wrong while deleting budget",
    };
  }
}