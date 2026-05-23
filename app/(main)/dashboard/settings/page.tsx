import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import ProfileSettingsCard from "@/components/settings/ProfileSettingsCard";
import DataExportCard from "@/components/settings/DataExportCard";
import DangerZoneCard from "@/components/settings/DangerZoneCard";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/sign-in");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            displayName: true,
            email: true,
            hashedPassword: true,
            createdAt: true,
            _count: {
                select: {
                    expenses: true,
                    subscriptions: true,
                    budgets: true,
                    recurringExpenses: true,
                },
            },
        },
    });

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="space-y-6">

            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <aside className="space-y-6">
                    <AccountOverviewCard
                        name={user.displayName}
                        email={user.email}
                        createdAt={user.createdAt}
                        stats={{
                            expenses: user._count.expenses,
                            subscriptions: user._count.subscriptions,
                            budgets: user._count.budgets,
                            recurringExpenses: user._count.recurringExpenses,
                        }}
                    />

                    <DataExportCard />
                </aside>

                <main className="space-y-6">
                    <ProfileSettingsCard
                        user={{
                            name: user.displayName,
                            email: user.email,
                            canManageCredentials: Boolean(user.hashedPassword),
                        }}
                    />

                    <DangerZoneCard />
                </main>
            </div>
        </div>
    );
}

type AccountOverviewCardProps = {
    name: string | null;
    email: string | null;
    createdAt: Date;
    stats: {
        expenses: number;
        subscriptions: number;
        budgets: number;
        recurringExpenses: number;
    };
};

function AccountOverviewCard({
    name,
    email,
    createdAt,
    stats,
}: AccountOverviewCardProps) {
    const userInitial = name?.charAt(0).toUpperCase() || "U";

    const joinedDate = new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(createdAt);

    return (
        <section className="overflow-hidden rounded-2xl border border-[#3D444D] bg-[#0D1117]">
            <div className="border-b border-[#3D444D] bg-linear-to-br from-[#151B23] to-[#0D1117] p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#3D444D] bg-[#010409] shadow-sm">
                        <span className="text-2xl font-bold text-[#3FB950]">
                            {userInitial}
                        </span>
                    </div>

                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-white">
                            {name || "LedgerOS User"}
                        </h2>
                        <p className="truncate text-sm text-[#8B949E]">
                            {email || "No email found"}
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#3D444D] bg-[#010409]/70 p-3">
                    <p className="text-xs text-[#8B949E]">Account created</p>
                    <p className="mt-1 text-sm font-medium text-[#C9D1D9]">
                        {joinedDate}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5">
                <AccountStat label="Expenses" value={stats.expenses} />
                <AccountStat label="Subscriptions" value={stats.subscriptions} />
                <AccountStat label="Budgets" value={stats.budgets} />
                <AccountStat label="Recurring" value={stats.recurringExpenses} />
            </div>
        </section>
    );
}

function AccountStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-[#3D444D] bg-[#151B23] p-3">
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-[#8B949E]">{label}</p>
        </div>
    );
}