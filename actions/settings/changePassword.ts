"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ChangePasswordSchema } from "@/lib/validators/settings";

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export async function changePasswordAction(input: ChangePasswordInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const parsed = ChangePasswordSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input",
      };
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        hashedPassword: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!user.hashedPassword) {
      return {
        success: false,
        message:
          "Password change is not available for accounts created with Google login",
      };
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!isCurrentPasswordCorrect) {
      return {
        success: false,
        message: "Current password is incorrect",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        hashedPassword,
      },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Change password error:", error);

    return {
      success: false,
      message: "Failed to change password",
    };
  }
}