"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

type GetSubscriptionsParams = {
  cursor?: string;
  search?: string;
  status?: string;
  type?: string;
};

function getYearlyAmount(amount: number, billingCycle: string) {
  if (billingCycle === "MONTHLY") return amount * 12;
  if (billingCycle === "QUARTERLY") return amount * 4;
  if (billingCycle === "HALF_YEARLY") return amount * 2;
  if (billingCycle === "YEARLY") return amount;

  return 0;
}

function getMonthlyAmount(amount: number, billingCycle: string) {
  if (billingCycle === "MONTHLY") return amount;
  if (billingCycle === "QUARTERLY") return amount / 3;
  if (billingCycle === "HALF_YEARLY") return amount / 6;
  if (billingCycle === "YEARLY") return amount / 12;

  return 0;
}

export async function getSubscriptionStats() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      monthlyTotal: 0,
      yearlyEstimate: 0,
      activeSubscriptions: 0,
      totalSubscriptions: 0,
      upcomingRenewal: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeSubscriptions, totalSubscriptions, upcomingRenewal] =
    await Promise.all([
      prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          amount: true,
          billingCycle: true,
        },
      }),

      prisma.subscription.count({
        where: {
          userId,
        },
      }),

      prisma.subscription.findFirst({
        where: {
          userId,
          isActive: true,
          nextRenewalDate: {
            gte: today,
          },
        },
        orderBy: {
          nextRenewalDate: "asc",
        },
        select: {
          name: true,
          nextRenewalDate: true,
        },
      }),
    ]);

  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    return total + getMonthlyAmount(Number(sub.amount), sub.billingCycle);
  }, 0);

  const yearlyEstimate = activeSubscriptions.reduce((total, sub) => {
    return total + getYearlyAmount(Number(sub.amount), sub.billingCycle);
  }, 0);

  return {
    monthlyTotal,
    yearlyEstimate,
    activeSubscriptions: activeSubscriptions.length,
    totalSubscriptions,
    upcomingRenewal: upcomingRenewal
      ? {
        name: upcomingRenewal.name,
        date: upcomingRenewal.nextRenewalDate.toISOString(),
      }
      : null,
  };
}

export async function getSubscriptions(params: GetSubscriptionsParams = {}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      subscriptions: [],
      nextCursor: null,
    };
  }

  const { cursor, search, status, type } = params;

  const where: any = {
    userId,
  };

  if (search?.trim()) {
    const searchValue = search.trim();

    where.OR = [
      {
        name: {
          contains: searchValue,
          mode: "insensitive",
        },
      },
      {
        planName: {
          contains: searchValue,
          mode: "insensitive",
        },
      },
      {
        category: {
          contains: searchValue,
          mode: "insensitive",
        },
      },
      {
        template: {
          is: {
            name: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (status === "ACTIVE") {
    where.isActive = true;
  }

  if (status === "INACTIVE") {
    where.isActive = false;
  }

  if (type === "MONTHLY") {
    where.billingCycle = "MONTHLY";
  }

  if (type === "YEARLY") {
    where.billingCycle = "YEARLY";
  }

  if (type === "CUSTOM") {
    where.templateId = null;
  }

  if (type === "UPCOMING") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    where.nextRenewalDate = {
      gte: today,
      lte: next7Days,
    };

    where.isActive = true;
  }

  const subscriptions = await prisma.subscription.findMany({
    where,
    orderBy: [
      {
        nextRenewalDate: "asc",
      },
      {
        id: "asc",
      },
    ],
    take: 20,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    include: {
      template: {
        select: {
          logo: true,
        },
      },
    },
  });

  const nextCursor =
    subscriptions.length === 20
      ? subscriptions[subscriptions.length - 1].id
      : null;

  return {
    subscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      name: subscription.name,
      amount: Number(subscription.amount),
      billingCycle: subscription.billingCycle,
      nextRenewalDate: subscription.nextRenewalDate.toISOString(),
      isActive: subscription.isActive,
      category: subscription.category,
      planName: subscription.planName,
      logo: subscription.template?.logo ?? null,
    })),
    nextCursor,
  };
}