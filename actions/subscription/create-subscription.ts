"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BillingCycle } from "@/app/generated/prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteCacheByPattern } from "@/lib/cache";

function getMaxAllowedRenewalDate(billingCycle: string) {
    const maxDate = new Date();

    if (billingCycle === "MONTHLY") maxDate.setMonth(maxDate.getMonth() + 2);
    if (billingCycle === "QUARTERLY") maxDate.setMonth(maxDate.getMonth() + 4);
    if (billingCycle === "HALF_YEARLY") maxDate.setMonth(maxDate.getMonth() + 7);
    if (billingCycle === "YEARLY") maxDate.setMonth(maxDate.getMonth() + 13);

    maxDate.setHours(23, 59, 59, 999);

    return maxDate;
}

const CreateSubscriptionZod = z.object({
    templateId: z.string().optional().nullable(),
    planId: z.string().optional().nullable(),

    name: z.string().min(2, "Subscription name is required").max(80),
    planName: z.string().max(80).optional().nullable(),
    category: z.string().min(2, "Category is required").max(50),

    amount: z.coerce.number().positive("Amount must be greater than 0"),
    billingCycle: z.nativeEnum(BillingCycle),

    nextRenewalDate: z.coerce.date(),
    isActive: z.boolean().default(true),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionZod>;

export async function createSubscription(data: CreateSubscriptionInput) {
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

        const valid = CreateSubscriptionZod.safeParse(data);

        if (!valid.success) {
            return {
                ok: false,
                message: null,
                error: valid.error.issues[0]?.message || "Invalid subscription data",
            };
        }

        const {
            templateId,
            planId,
            name,
            planName,
            category,
            amount,
            billingCycle,
            nextRenewalDate,
            isActive,
        } = valid.data;

        if (templateId) {
            const template = await prisma.subscriptionTemplate.findUnique({
                where: {
                    id: templateId,
                },
                select: {
                    id: true,
                },
            });

            if (!template) {
                return {
                    ok: false,
                    message: null,
                    error: "Selected subscription template does not exist",
                };
            }
        }

        if (planId) {
            const plan = await prisma.subscriptionPlan.findUnique({
                where: {
                    id: planId,
                },
                select: {
                    id: true,
                    templateId: true,
                },
            });

            if (!plan) {
                return {
                    ok: false,
                    message: null,
                    error: "Selected subscription plan does not exist",
                };
            }

            if (templateId && plan.templateId !== templateId) {
                return {
                    ok: false,
                    message: null,
                    error: "Selected plan does not belong to selected template",
                };
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxAllowedDate = getMaxAllowedRenewalDate(billingCycle);

        if (nextRenewalDate < today) {
            return {
                ok: false,
                message: null,
                error: "Next renewal date cannot be in the past",
            };
        }

        if (nextRenewalDate > maxAllowedDate) {
            return {
                ok: false,
                message: null,
                error: "Next renewal date is too far for the selected billing cycle",
            };
        }

        const subscription = await prisma.subscription.create({
            data: {
                userId,

                templateId: templateId || null,
                planId: planId || null,

                name,
                planName: planName || null,
                category,

                amount,
                billingCycle,
                nextRenewalDate,
                isActive,
            },
            select: {
                id: true,
            },
        });

        await deleteCacheByPattern(`dashboard:${session.user.id}:*`);
        await deleteCacheByPattern(`insights:${session.user.id}:*`);

        revalidatePath("/dashboard/subscriptions");
        revalidatePath("/dashboard");

        return {
            ok: true,
            message: "Subscription added successfully",
            error: null,
            subscriptionId: subscription.id,
        };
    } catch (error) {
        console.error("CREATE_SUBSCRIPTION_ERROR", error);

        return {
            ok: false,
            message: null,
            error: "Something went wrong while adding subscription",
        };
    }
}