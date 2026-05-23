"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { UpdateProfileSchema } from "@/lib/validators/settings";

type UpdateProfileInput = {
  name: string;
};

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const parsed = UpdateProfileSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input",
      };
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        displayName: parsed.data.name,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Update profile error:", error);

    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}