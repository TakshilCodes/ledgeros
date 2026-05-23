import prisma from "@/lib/prisma";
import { BillingCycle } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BATCH_SIZE = 500;
const MAX_BATCHES = 10;

function getNextRenewalDate(date: Date, billingCycle: BillingCycle) {
  const nextDate = new Date(date);

  if (billingCycle === "MONTHLY") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  if (billingCycle === "QUARTERLY") {
    nextDate.setMonth(nextDate.getMonth() + 3);
  }

  if (billingCycle === "HALF_YEARLY") {
    nextDate.setMonth(nextDate.getMonth() + 6);
  }

  if (billingCycle === "YEARLY") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate;
}

function moveDateUntilFuture(date: Date, billingCycle: BillingCycle) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  while (nextDate < today) {
    nextDate = getNextRenewalDate(nextDate, billingCycle);
  }

  return nextDate;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalChecked = 0;
    let totalUpdated = 0;
    let batchCount = 0;

    while (batchCount < MAX_BATCHES) {
      const overdueSubscriptions = await prisma.subscription.findMany({
        where: {
          isActive: true,
          nextRenewalDate: {
            lt: today,
          },
        },
        select: {
          id: true,
          nextRenewalDate: true,
          billingCycle: true,
        },
        orderBy: {
          nextRenewalDate: "asc",
        },
        take: BATCH_SIZE,
      });

      if (overdueSubscriptions.length === 0) {
        break;
      }

      totalChecked += overdueSubscriptions.length;

      for (const subscription of overdueSubscriptions) {
        const newNextRenewalDate = moveDateUntilFuture(
          subscription.nextRenewalDate,
          subscription.billingCycle
        );

        await prisma.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            nextRenewalDate: newNextRenewalDate,
          },
        });

        totalUpdated++;
      }

      batchCount++;
    }

    return NextResponse.json({
      ok: true,
      message: "Subscription renewal dates updated successfully",
      batches: batchCount,
      checked: totalChecked,
      updated: totalUpdated,
      limitReached: batchCount === MAX_BATCHES,
    });
  } catch (error) {
    console.error("UPDATE_SUBSCRIPTIONS_CRON_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Something went wrong while updating subscription renewals",
      },
      { status: 500 }
    );
  }
}