"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function deleteSubscription(id: string) {
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

    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!subscription) {
      return {
        ok: false,
        message: null,
        error: "Subscription not found",
      };
    }

    await prisma.subscription.delete({
      where: {
        id: subscription.id,
      },
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: "Subscription deleted successfully",
      error: null,
    };
  } catch (error) {
    console.error("DELETE_SUBSCRIPTION_ERROR", error);

    return {
      ok: false,
      message: null,
      error: "Something went wrong while deleting subscription",
    };
  }
}