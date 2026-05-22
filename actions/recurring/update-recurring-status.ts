"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateRecurringStatusSchema = z.object({
  id: z.string().min(1, "Recurring expense ID is required"),
  isActive: z.boolean(),
});

type UpdateRecurringStatusInput = z.infer<typeof UpdateRecurringStatusSchema>;

export async function updateRecurringStatus(data: UpdateRecurringStatusInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        ok: false,
        msg: null,
        error: "Unauthorized",
      };
    }

    const valid = UpdateRecurringStatusSchema.safeParse(data);

    if (!valid.success) {
      return {
        ok: false,
        msg: null,
        error: valid.error.issues[0]?.message || "Invalid data",
      };
    }

    const { id, isActive } = valid.data;

    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id,
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

    await prisma.recurringExpense.update({
      where: {
        id: recurringExpense.id,
      },
      data: {
        isActive,
      },
    });

    revalidatePath("/dashboard/recurring");
    revalidatePath("/dashboard");

    return {
      ok: true,
      msg: isActive
        ? "Recurring expense activated successfully"
        : "Recurring expense deactivated successfully",
      error: null,
    };
  } catch (error) {
    console.error("UPDATE_RECURRING_STATUS_ERROR", error);

    return {
      ok: false,
      msg: null,
      error: "Something went wrong",
    };
  }
}