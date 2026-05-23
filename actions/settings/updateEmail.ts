"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { UpdateEmailSchema } from "@/lib/validators/settings";

type UpdateEmailInput = {
  email: string;
};

export async function updateEmailAction(input: UpdateEmailInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const parsed = UpdateEmailSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input",
      };
    }

    const { email } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        email,
      },
    });

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      message: "Email updated successfully",
    };
  } catch (error) {
    console.error("Update email error:", error);

    return {
      success: false,
      message: "Failed to update email",
    };
  }
}