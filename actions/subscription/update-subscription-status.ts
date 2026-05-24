"use server";

import { authOptions } from "@/lib/auth";
import { deleteCacheByPattern } from "@/lib/cache";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateSubscriptionStatus(id: string, isActive: boolean) {
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
        error: "Subscription id is required",
      };
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingSubscription) {
      return {
        ok: false,
        message: null,
        error: "Subscription not found",
      };
    }

    await prisma.subscription.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
    });

    await deleteCacheByPattern(`dashboard:${userId}:*`);
    await deleteCacheByPattern(`insights:${userId}:*`);

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: isActive
        ? "Subscription activated successfully"
        : "Subscription deactivated successfully",
      error: null,
    };
  } catch (error) {
    console.error("UPDATE_SUBSCRIPTION_STATUS_ERROR", error);

    return {
      ok: false,
      message: null,
      error: "Something went wrong while updating subscription status",
    };
  }
}