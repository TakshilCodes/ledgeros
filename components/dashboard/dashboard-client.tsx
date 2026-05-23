"use client";

import {
    AlertTriangle,
    BarChart3,
    CalendarClock,
    Car,
    ChevronDown,
    CreditCard,
    Flame,
    Grid2X2,
    IndianRupee,
    PiggyBank,
    ReceiptText,
    TrendingUp,
    Utensils,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SpendingBarChart, SpendingDonutChart } from "./dashboard-charts";
import { useSession } from "next-auth/react";

type DashboardAlert = {
    type: "success" | "warning" | "danger" | "info";
    title: string;
    message: string;
} | null;

type CategoryBreakdown = {
    category: string;
    label: string;
    amount: number;
    percentage: number;
};

type RecentExpense = {
    id: string;
    name: string;
    category: string;
    label: string;
    amount: number;
    formattedAmount: string;
    spentAt: string;
};

type UpcomingRenewal = {
    id: string;
    name: string;
    planName: string | null;
    amount: number;
    formattedAmount: string;
    billingCycle: string;
    nextRenewalDate: string;
    due: string;
};

type CategoryBudget = {
    id: string;
    name: string;
    category: string | null;
    label: string;
    amount: number;
    spent: number;
    remaining: number;
    usedPercentage: number;
};

type DashboardData = {
    month: number;
    year: number;

    summaryCards: {
        todaySpend: {
            title: string;
            value: number;
            formattedValue: string;
            subtitle: string;
        };
        thisMonthSpend: {
            title: string;
            value: number;
            formattedValue: string;
            subtitle: string;
        };
        subscriptionsTotal: {
            title: string;
            value: number;
            formattedValue: string;
            subtitle: string;
        };
        budgetLeft: {
            title: string;
            value: number;
            formattedValue: string;
            subtitle: string;
            isOverBudget: boolean;
        };
    };

    alert: DashboardAlert;

    expenseOverview: {
        totalSpent: number;
        categoryBreakdown: CategoryBreakdown[];
    };

    recentExpenses: RecentExpense[];
    upcomingRenewals: UpcomingRenewal[];
    categoryBudgets: CategoryBudget[];

    meta: {
        expenseCount: number;
        activeSubscriptionCount: number;
        hasMonthlyBudget: boolean;
        hasDailyLimit: boolean;
    };

    noSpend: {
        streak: number;
        days: {
            label: string;
            date: string;
            isFuture: boolean;
            hasExpense: boolean;
            isNoSpendDay: boolean;
        }[];
    };
} | null;

type Props = {
    data: DashboardData;
    selectedRange: string;
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatTime(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}

function getExpenseIcon(category: string) {
    if (category === "FOOD") return Utensils;
    if (category === "TRAVEL") return Car;

    return ReceiptText;
}

function MonthSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative shrink-0">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-8 cursor-pointer appearance-none rounded-lg border border-[#3D444D] bg-[#151B23] px-3 pr-8 text-xs text-[#C9D1D9] outline-none transition hover:bg-[#1f2630] focus:border-[#238636]"
            >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="this-year">This Year</option>
            </select>

            <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E]"
            />
        </div>
    );
}

function EmptyBlock({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-dashed border-[#3D444D] bg-[#010409] p-6 text-center">
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs text-[#8B949E]">{description}</p>
        </div>
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon: Icon,
    isDanger,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    isDanger?: boolean;
}) {
    return (
        <div className="min-w-57.5 rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#151B23] text-[#58A6FF]">
                        <Icon size={15} />
                    </div>

                    <p className="mt-4 text-xs font-semibold text-white">{title}</p>

                    <h3
                        className={`mt-1 truncate text-2xl font-bold ${isDanger ? "text-red-400" : "text-white"
                            }`}
                    >
                        {value}
                    </h3>

                    <p className="mt-2 text-xs text-[#8B949E]">{subtitle}</p>
                </div>

                <TrendingUp size={14} className="text-[#3FB950]" />
            </div>
        </div>
    );
}

function ProgressBar({
    value,
    color = "bg-[#58A6FF]",
}: {
    value: number;
    color?: string;
}) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
            <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
    );
}

export default function DashboardClient({ data }: Props) {

    const session = useSession();
    const userName = session.data?.user?.name?.split(" ")[0] || "User";

    if (!data) {
        return (
            <main className="min-h-screen bg-[#010409] px-4 py-6 text-[#C9D1D9]">
                <EmptyBlock
                    title="Unable to load dashboard"
                    description="Something went wrong while loading your dashboard."
                />
            </main>
        );
    }

    const dashboardData = data;

    const summaryCards = [
        {
            title: dashboardData.summaryCards.todaySpend.title,
            value: dashboardData.summaryCards.todaySpend.formattedValue,
            subtitle: dashboardData.summaryCards.todaySpend.subtitle,
            icon: ReceiptText,
        },
        {
            title: dashboardData.summaryCards.thisMonthSpend.title,
            value: dashboardData.summaryCards.thisMonthSpend.formattedValue,
            subtitle: dashboardData.summaryCards.thisMonthSpend.subtitle,
            icon: Wallet,
        },
        {
            title: dashboardData.summaryCards.subscriptionsTotal.title,
            value: dashboardData.summaryCards.subscriptionsTotal.formattedValue,
            subtitle: dashboardData.summaryCards.subscriptionsTotal.subtitle,
            icon: CreditCard,
        },
        {
            title: dashboardData.summaryCards.budgetLeft.title,
            value: dashboardData.summaryCards.budgetLeft.formattedValue,
            subtitle: dashboardData.summaryCards.budgetLeft.subtitle,
            icon: PiggyBank,
            isDanger: dashboardData.summaryCards.budgetLeft.isOverBudget,
        },
    ];

    return (
        <main className="min-h-screen max-w-full overflow-x-hidden bg-[#010409] px-4 py-6 text-[#C9D1D9] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5 overflow-x-hidden">
                <section>
                    <h1 className="text-xl font-bold text-white">
                        Welcome back, {userName} 👋
                    </h1>
                    <p className="mt-1 text-sm text-[#8B949E]">
                        Here&apos;s your financial overview.
                    </p>
                </section>

                <section className="relative max-w-full overflow-hidden">
                    <div className="scrollbar-hide flex max-w-full gap-3 overflow-x-auto pb-2 xl:grid xl:grid-cols-4 xl:overflow-visible">
                        {summaryCards.map((card) => (
                            <SummaryCard key={card.title} {...card} />
                        ))}
                    </div>
                </section>

                {dashboardData.alert ? (
                    <section
                        className={`rounded-xl border px-4 py-3 text-sm ${dashboardData.alert.type === "danger"
                            ? "border-red-500/30 bg-red-500/10 text-red-400"
                            : dashboardData.alert.type === "warning"
                                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                                : "border-[#58A6FF]/30 bg-[#58A6FF]/10 text-[#58A6FF]"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <p className="font-medium">{dashboardData.alert.message}</p>
                        </div>
                    </section>
                ) : null}

                <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
                    <div className="space-y-4">
                        <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-xl border border-[#3D444D] bg-[#010409] p-4">
                                {dashboardData.expenseOverview.categoryBreakdown.length > 0 ? (
                                    <SpendingDonutChart
                                        categories={dashboardData.expenseOverview.categoryBreakdown}
                                    />
                                ) : (
                                    <div className="flex h-55 items-center justify-center text-xs text-[#8B949E]">
                                        No category data yet
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-[#3D444D] bg-[#010409] p-4">
                                {dashboardData.expenseOverview.categoryBreakdown.length > 0 ? (
                                    <SpendingBarChart
                                        categories={dashboardData.expenseOverview.categoryBreakdown}
                                    />
                                ) : (
                                    <div className="flex h-55 items-center justify-center text-xs text-[#8B949E]">
                                        No spending data yet
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold text-white">
                                        Recent Expenses
                                    </h2>
                                    <Link
                                        href="/dashboard/expenses"
                                        className="text-xs font-medium text-[#58A6FF]"
                                    >
                                        View All
                                    </Link>
                                </div>

                                <div className="space-y-2">
                                    {dashboardData.recentExpenses.length > 0 ? (
                                        dashboardData.recentExpenses.slice(0, 4).map((expense) => {
                                            const Icon = getExpenseIcon(expense.category);

                                            return (
                                                <div
                                                    key={expense.id}
                                                    className="flex items-center justify-between gap-3 rounded-xl bg-[#010409] px-3 py-2"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#151B23] text-[#58A6FF]">
                                                            <Icon size={16} />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-white">
                                                                {expense.name}
                                                            </p>
                                                            <p className="text-xs text-[#8B949E]">
                                                                {expense.label}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <p className="text-sm font-semibold text-white">
                                                            {expense.formattedAmount}
                                                        </p>
                                                        <p className="text-xs text-[#8B949E]">
                                                            {formatTime(expense.spentAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-[#8B949E]">
                                            No recent expenses.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold text-white">
                                        Upcoming Renewals
                                    </h2>
                                    <Link
                                        href="/dashboard/subscriptions"
                                        className="text-xs font-medium text-[#58A6FF]"
                                    >
                                        View All
                                    </Link>
                                </div>

                                <div className="space-y-2">
                                    {dashboardData.upcomingRenewals.length > 0 ? (
                                        dashboardData.upcomingRenewals.slice(0, 4).map((renewal) => (
                                            <div
                                                key={renewal.id}
                                                className="flex items-center justify-between gap-3 rounded-xl bg-[#010409] px-3 py-2"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#112617] text-[#3FB950]">
                                                        <CalendarClock size={16} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-white">
                                                            {renewal.name}
                                                        </p>
                                                        <p className="text-xs text-[#8B949E]">
                                                            {renewal.planName || renewal.billingCycle}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-sm font-semibold text-white">
                                                        {renewal.formattedAmount}
                                                    </p>
                                                    <p className="text-xs font-medium text-yellow-400">
                                                        {renewal.due}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#8B949E]">
                                            No upcoming renewals.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-white md:text-base">
                                        Budget Overview
                                    </h2>
                                    <p className="mt-1 text-xs text-[#8B949E]">
                                        Monthly spending limit status
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${dashboardData.summaryCards.budgetLeft.isOverBudget
                                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                                        : "border-[#238636]/30 bg-[#238636]/10 text-[#3FB950]"
                                        }`}
                                >
                                    {dashboardData.summaryCards.budgetLeft.isOverBudget
                                        ? "Over Budget"
                                        : "On Track"}
                                </span>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-[#8B949E]">Budget Status</span>
                                    <span
                                        className={
                                            dashboardData.summaryCards.budgetLeft.isOverBudget
                                                ? "font-semibold text-red-400"
                                                : "font-semibold text-white"
                                        }
                                    >
                                        {dashboardData.summaryCards.budgetLeft.formattedValue}
                                    </span>
                                </div>

                                <ProgressBar
                                    value={
                                        dashboardData.summaryCards.budgetLeft.isOverBudget
                                            ? 100
                                            : 68
                                    }
                                    color={
                                        dashboardData.summaryCards.budgetLeft.isOverBudget
                                            ? "bg-red-500"
                                            : "bg-[#238636]"
                                    }
                                />

                                <p className="mt-3 text-xs text-[#8B949E]">
                                    {dashboardData.summaryCards.budgetLeft.subtitle}
                                </p>
                            </div>

                            <div className="mt-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white">
                                        Category Budget
                                    </h3>
                                    <Link
                                        href="/dashboard/budgets"
                                        className="text-xs font-medium text-[#58A6FF]"
                                    >
                                        View
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {dashboardData.categoryBudgets.length > 0 ? (
                                        dashboardData.categoryBudgets.map((budget) => (
                                            <div key={budget.id}>
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <p className="text-xs font-semibold text-white">
                                                        {budget.label}
                                                    </p>
                                                    <p className="text-xs text-[#8B949E]">
                                                        {formatCurrency(budget.spent)} /{" "}
                                                        {formatCurrency(budget.amount)}
                                                    </p>
                                                </div>

                                                <ProgressBar
                                                    value={budget.usedPercentage}
                                                    color={
                                                        budget.usedPercentage >= 100
                                                            ? "bg-red-500"
                                                            : budget.usedPercentage >= 80
                                                                ? "bg-yellow-500"
                                                                : "bg-[#58A6FF]"
                                                    }
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#8B949E]">
                                            No category budgets set.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                            <div className="flex items-center gap-2">
                                <Flame size={18} className="text-orange-400" />
                                <h2 className="text-sm font-semibold text-white md:text-base">
                                    No Spend Streak
                                </h2>
                            </div>

                            <p className="mt-4 text-2xl font-bold text-orange-400">
                                {dashboardData.noSpend.streak}{" "}
                                {dashboardData.noSpend.streak === 1 ? "Day" : "Days"}
                            </p>

                            <p className="mt-1 text-sm text-[#8B949E]">
                                {dashboardData.noSpend.streak > 0
                                    ? "Keep it up! You're on fire 🔥"
                                    : "Spend-free days will appear here."}
                            </p>

                            <div className="mt-4 flex items-center gap-2">
                                {dashboardData.noSpend.days.map((day, index) => (
                                    <div key={`${day.label}-${index}`} className="text-center">
                                        <p className="mb-2 text-xs text-[#8B949E]">{day.label}</p>

                                        <div
                                            title={
                                                day.isFuture
                                                    ? "Future day"
                                                    : day.isNoSpendDay
                                                        ? "No spend day"
                                                        : "Spending day"
                                            }
                                            className={`h-7 w-7 rounded-full border ${day.isNoSpendDay
                                                ? "border-[#238636] bg-[#238636]"
                                                : day.hasExpense
                                                    ? "border-red-500/40 bg-red-500/20"
                                                    : "border-[#3D444D] bg-[#151B23]"
                                                }`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-white md:text-base">
                                    Weekly Report
                                </h2>
                                <Link href="/dashboard/insights" className="text-xs text-[#58A6FF]">
                                    Full Report
                                </Link>
                            </div>

                            <p className="text-xs text-[#8B949E]">This Week</p>
                            <p className="mt-1 text-2xl font-bold text-white">
                                {dashboardData.summaryCards.thisMonthSpend.formattedValue}
                            </p>
                            <p className="mt-1 text-xs text-[#8B949E]">Total Spend</p>

                            <div className="mt-4 rounded-xl bg-[#010409] p-3">
                                <div className="flex items-start gap-2">
                                    <BarChart3 size={16} className="mt-0.5 text-yellow-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            Spending summary ready
                                        </p>
                                        <p className="mt-1 text-xs text-[#8B949E]">
                                            Check Insights for deeper category and budget analysis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    );
}