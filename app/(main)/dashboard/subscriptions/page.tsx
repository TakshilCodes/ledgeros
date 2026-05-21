import { SubscriptionsClient } from "@/components/subscriptions/subscriptions-client";
import {
    getSubscriptionStats,
    getSubscriptions,
} from "@/actions/subscription/get-subscriptions";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getSubscriptionTemplates } from "@/actions/subscription/get-subscription-templates";

type PageProps = {
    searchParams: Promise<{
        search?: string;
        status?: string;
        type?: string;
    }>;
};

export default async function SubscriptionsPage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/signin");
    }

    const params = await searchParams;

    const filters = {
        search: params.search || "",
        status: params.status || "ALL",
        type: params.type || "ALL",
    };

    const [stats, subscriptionsData, templates] = await Promise.all([
        getSubscriptionStats(),
        getSubscriptions(filters),
        getSubscriptionTemplates(),
    ]);

    return (
        <SubscriptionsClient
            initialSubscriptions={subscriptionsData.subscriptions}
            initialCursor={subscriptionsData.nextCursor}
            userStats={stats}
            filters={filters}
            templates={templates}
        />
    );
}