"use server";

import { BillingCycle } from "@/app/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateSubscriptionZod = z.object({
  name: z.string().min(2, "Subscription name is required").max(80),
  planName: z.string().max(80).optional().nullable(),
  category: z.string().min(2, "Category is required").max(50),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  billingCycle: z.nativeEnum(BillingCycle),
  nextRenewalDate: z.coerce.date(),
  isActive: z.boolean(),
});

export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionZod>;

function getMaxAllowedRenewalDate(billingCycle: BillingCycle) {
  const maxDate = new Date();

  if (billingCycle === "MONTHLY") {
    maxDate.setMonth(maxDate.getMonth() + 2);
  }

  if (billingCycle === "QUARTERLY") {
    maxDate.setMonth(maxDate.getMonth() + 4);
  }

  if (billingCycle === "HALF_YEARLY") {
    maxDate.setMonth(maxDate.getMonth() + 7);
  }

  if (billingCycle === "YEARLY") {
    maxDate.setMonth(maxDate.getMonth() + 13);
  }

  maxDate.setHours(23, 59, 59, 999);

  return maxDate;
}

export async function updateSubscription(
  id: string,
  data: UpdateSubscriptionInput
) {
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

    const valid = UpdateSubscriptionZod.safeParse(data);

    if (!valid.success) {
      return {
        ok: false,
        message: null,
        error: valid.error.issues[0]?.message || "Invalid subscription data",
      };
    }

    const {
      name,
      planName,
      category,
      amount,
      billingCycle,
      nextRenewalDate,
      isActive,
    } = valid.data;

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const renewalDate = new Date(nextRenewalDate);
    renewalDate.setHours(12, 0, 0, 0);

    const maxAllowedDate = getMaxAllowedRenewalDate(billingCycle);

    if (renewalDate < today) {
      return {
        ok: false,
        message: null,
        error: "Next renewal date cannot be in the past",
      };
    }

    if (renewalDate > maxAllowedDate) {
      return {
        ok: false,
        message: null,
        error: "Next renewal date is too far for the selected billing cycle",
      };
    }

    await prisma.subscription.update({
      where: {
        id: existingSubscription.id,
      },
      data: {
        name,
        planName: planName || null,
        category,
        amount,
        billingCycle,
        nextRenewalDate: renewalDate,
        isActive,
      },
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: "Subscription updated successfully",
      error: null,
    };
  } catch (error) {
    console.error("UPDATE_SUBSCRIPTION_ERROR", error);

    return {
      ok: false,
      message: null,
      error: "Something went wrong while updating subscription",
    };
  }
}