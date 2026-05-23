"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type DeleteAccountInput = {
  confirmationText: string;
};

export async function deleteAccountAction(input: DeleteAccountInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (input.confirmationText !== "DELETE") {
    return {
      success: false,
      message: "Please type DELETE to confirm account deletion",
    };
  }

  try {
    const userId = session.user.id;

    await prisma.$transaction(async (tx) => {
      await tx.expense.deleteMany({
        where: {
          userId,
        },
      });

      await tx.subscription.deleteMany({
        where: {
          userId,
        },
      });

      await tx.recurringExpense.deleteMany({
        where: {
          userId,
        },
      });

      await tx.budget.deleteMany({
        where: {
          userId,
        },
      });

      await tx.user.delete({
        where: {
          id: userId,
        },
      });
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return {
      success: false,
      message: "Failed to delete account",
    };
  }

  redirect("/sign-in");
}