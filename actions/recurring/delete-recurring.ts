"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

type DeleteRecurringInput = {
  id: string;
};

export async function deleteRecurring(data: DeleteRecurringInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        ok: false,
        msg: null,
        error: "Unauthorized",
      };
    }

    if (!data.id) {
      return {
        ok: false,
        msg: null,
        error: "Recurring expense ID is required",
      };
    }

    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id: data.id,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!recurringExpense) {
      return {
        ok: false,
        msg: null,
        error: "Recurring expense not found",
      };
    }

    await prisma.recurringExpense.delete({
      where: {
        id: recurringExpense.id,
      },
    });

    revalidatePath("/dashboard/recurring");
    revalidatePath("/dashboard");

    return {
      ok: true,
      msg: "Recurring expense deleted successfully",
      error: null,
    };
  } catch (error) {
    console.error("DELETE_RECURRING_ERROR", error);

    return {
      ok: false,
      msg: null,
      error: "Something went wrong",
    };
  }
}