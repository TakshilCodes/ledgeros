import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DangerZoneCard from "@/components/settings/DangerZoneCard";
import DataExportCard from "@/components/settings/DataExportCard";
import ProfileSettingsCard from "@/components/settings/ProfileSettingsCard";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  if (!user) redirect("/signin");

  return (
    <div className="w-full min-w-0 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, credentials, exports, and data.
        </p>
      </header>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="self-start overflow-hidden rounded-xl border border-border/70 bg-card">
          <AccountOverview
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

        <main className="min-w-0 space-y-4">
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

type AccountOverviewProps = {
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

function AccountOverview({
  name,
  email,
  createdAt,
  stats,
}: AccountOverviewProps) {
  const userInitial = name?.charAt(0).toUpperCase() || "U";
  const joinedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(createdAt);

  return (
    <section>
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-green-400">
            {userInitial}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground">
              {name || "LedgerOS user"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {email || "No email found"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <span className="text-xs text-muted-foreground">Member since</span>
          <span className="text-xs font-medium text-foreground">{joinedDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-border/70">
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
    <div className="border-r border-b border-border/60 px-4 py-3 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0">
      <p className="text-base font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
