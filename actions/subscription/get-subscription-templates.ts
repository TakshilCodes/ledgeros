"use server";

import prisma from "@/lib/prisma";

export async function getSubscriptionTemplates() {
  const templates = await prisma.subscriptionTemplate.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      plans: {
        orderBy: {
          amount: "asc",
        },
        select: {
          id: true,
          name: true,
          amount: true,
          billingCycle: true,
        },
      },
    },
  });

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    logo: template.logo,
    category: template.category,
    plans: template.plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      amount: Number(plan.amount),
      billingCycle: plan.billingCycle,
    })),
  }));
}