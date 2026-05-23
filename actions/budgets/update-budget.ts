"use server";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { BudgetType, ExpenseCategory } from "@/app/generated/prisma/client";

type UpdateBudgetInput = {
  name?: string;
  type: BudgetType;
  category?: ExpenseCategory | null;
  amount: number;
  month: number;
  year: number;
};

export async function updateBudget(id: string, data: UpdateBudgetInput) {
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

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingBudget) {
      return {
        ok: false,
        message: null,
        error: "Budget not found",
      };
    }

    const amount = Number(data.amount);
    const month = Number(data.month);
    const year = Number(data.year);

    if (!data.type) {
      return {
        ok: false,
        message: null,
        error: "Budget type is required",
      };
    }

    if (!amount || amount <= 0) {
      return {
        ok: false,
        message: null,
        error: "Budget amount must be greater than 0",
      };
    }

    if (!month || month < 1 || month > 12) {
      return {
        ok: false,
        message: null,
        error: "Invalid budget month",
      };
    }

    if (!year || year < 2020 || year > 2100) {
      return {
        ok: false,
        message: null,
        error: "Invalid budget year",
      };
    }

    if (data.type === "CATEGORY" && !data.category) {
      return {
        ok: false,
        message: null,
        error: "Category is required for category budget",
      };
    }

    if (data.type !== "CATEGORY" && data.category) {
      return {
        ok: false,
        message: null,
        error: "Category is only allowed for category budgets",
      };
    }

    const category = data.type === "CATEGORY" ? data.category : null;

    const duplicateBudget = await prisma.budget.findFirst({
      where: {
        userId,
        type: data.type,
        month,
        year,
        category,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicateBudget) {
      return {
        ok: false,
        message: null,
        error:
          data.type === "CATEGORY"
            ? "A budget already exists for this category and month"
            : `A ${data.type.toLowerCase().replace("_", " ")} budget already exists for this month`,
      };
    }

    await prisma.budget.update({
      where: {
        id,
      },
      data: {
        name: data.name?.trim() || null,
        type: data.type,
        category,
        amount,
        month,
        year,
      },
    });

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: "Budget updated successfully",
      error: null,
    };
  } catch (error) {
    console.error("UPDATE_BUDGET_ERROR", error);

    return {
      ok: false,
      message: null,
      error: "Something went wrong while updating budget",
    };
  }
}