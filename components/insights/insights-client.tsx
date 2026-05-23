"use client";

import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    IndianRupee,
    Info,
    Layers,
    PieChart,
    ReceiptText,
    RefreshCcw,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type InsightType = "success" | "warning" | "danger" | "info";

type Insight = {
    type: InsightType;
    title: string;
    message: string;
};

type CategoryBreakdown = {
    category: string;
    label: string;
    amount: number;
    percentage: number;
};

type HighestCategory = {
    category: string;
    label: string;
    amount: number;
    percentage: number;
} | null;

type BudgetStatus = {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    usedPercentage: number;
    isOverBudget: boolean;
} | null;

type CategoryBudgetStatus = {
    category: string;
    label: string;
    spent: number;
    budget: number | null;
    remaining: number | null;
    usedPercentage: number | null;
    isOverBudget: boolean;
};

type UpcomingSubscription = {
    id: string;
    name: string;
    amount: number;
    billingCycle: string;
    nextRenewalDate: string;
    category: string;
};

type UpcomingRecurringExpense = {
    id: string;
    name: string;
    amount: number;
    billingCycle: string;
    nextDueDate: string;
    category: string;
};

type RecentExpense = {
    id: string;
    name: string;
    amount: number;
    category: string;
    spentAt: string;
};

type InsightsData = {
    month: number;
    year: number;
    summary: {
        totalSpent: number;
        highestCategory: HighestCategory;
        activeSubscriptionMonthlyCost: number;
        recurringMonthlyCost: number;
        averageDailySpend: number;
        subscriptionShare: number;
        recurringShare: number;
    };
    categoryBreakdown: CategoryBreakdown[];
    budgetStatus: BudgetStatus;
    categoryBudgetStatus: CategoryBudgetStatus[];
    upcomingSubscriptions: UpcomingSubscription[];
    upcomingRecurringExpenses: UpcomingRecurringExpense[];
    recentExpenses: RecentExpense[];
    insights: Insight[];
} | null;

type Props = {
    data: InsightsData;
    selectedMonth: number;
    selectedYear: number;
};

const monthOptions = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

function formatBillingCycle(cycle: string) {
    return cycle
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function getYearOptions() {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 6 }, (_, index) => currentYear - 1 + index);
}

function getPreviousMonth(month: number, year: number) {
    if (month === 1) {
        return {
            month: 12,
            year: year - 1,
        };
    }

    return {
        month: month - 1,
        year,
    };
}

function getNextMonth(month: number, year: number) {
    if (month === 12) {
        return {
            month: 1,
            year: year + 1,
        };
    }

    return {
        month: month + 1,
        year,
    };
}

function getInsightStyle(type: InsightType) {
    if (type === "danger") {
        return {
            icon: AlertTriangle,
            className: "border-red-500/30 bg-red-500/10 text-red-400",
            iconClassName: "text-red-400",
        };
    }

    if (type === "warning") {
        return {
            icon: AlertTriangle,
            className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
            iconClassName: "text-yellow-300",
        };
    }

    if (type === "success") {
        return {
            icon: CheckCircle2,
            className: "border-[#238636]/30 bg-[#238636]/10 text-[#3FB950]",
            iconClassName: "text-[#3FB950]",
        };
    }

    return {
        icon: Info,
        className: "border-[#58A6FF]/30 bg-[#58A6FF]/10 text-[#58A6FF]",
        iconClassName: "text-[#58A6FF]",
    };
}

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
}) {
    return (
        <div className="min-w-57.5 snap-start rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 shadow-sm md:min-w-0">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm text-[#8B949E]">{title}</p>
                    <h3 className="mt-2 truncate text-2xl font-semibold text-white">
                        {value}
                    </h3>
                    <p className="mt-1 text-xs text-[#6E7681]">{description}</p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
}

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[#3D444D] bg-[#0D1117] p-8 text-center">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-[#8B949E]">{description}</p>
        </div>
    );
}

export default function InsightsClient({
    data,
    selectedMonth,
    selectedYear,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const selectedMonthLabel =
        monthOptions.find((month) => month.value === selectedMonth)?.label ||
        "Current Month";

    function updateParams(params: { month?: number; year?: number }) {
        const searchParams = new URLSearchParams();

        searchParams.set("month", String(params.month ?? selectedMonth));
        searchParams.set("year", String(params.year ?? selectedYear));

        router.replace(`${pathname}?${searchParams.toString()}`);
    }

    function handlePreviousMonth() {
        const previous = getPreviousMonth(selectedMonth, selectedYear);

        updateParams({
            month: previous.month,
            year: previous.year,
        });
    }

    function handleNextMonth() {
        const next = getNextMonth(selectedMonth, selectedYear);

        updateParams({
            month: next.month,
            year: next.year,
        });
    }

    if (!data) {
        return (
            <main className="min-h-screen max-w-full overflow-x-hidden bg-[#010409] px-4 py-6 text-[#C9D1D9] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <EmptyState
                        title="Unable to load insights"
                        description="Something went wrong while loading your insights."
                    />
                </div>
            </main>
        );
    }

    const highestCategory = data.summary.highestCategory;

    return (
        <main className="min-h-screen max-w-full overflow-x-hidden bg-[#010409] px-4 py-6 text-[#C9D1D9] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6 overflow-x-hidden">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-2 rounded-2xl border border-[#3D444D] bg-[#0D1117] p-2">
                        <button
                            type="button"
                            onClick={handlePreviousMonth}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#C9D1D9] transition hover:bg-[#21262D] cursor-pointer"
                        >
                            <ChevronLeft size={17} />
                        </button>

                        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 sm:flex-none">
                            <select
                                value={selectedMonth}
                                onChange={(event) =>
                                    updateParams({
                                        month: Number(event.target.value),
                                    })
                                }
                                className="h-10 min-w-30 rounded-xl border border-[#3D444D] bg-[#151B23] px-3 text-sm text-[#C9D1D9] outline-none transition focus:border-[#58A6FF] cursor-pointer"
                            >
                                {monthOptions.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedYear}
                                onChange={(event) =>
                                    updateParams({
                                        year: Number(event.target.value),
                                    })
                                }
                                className="h-10 min-w-24 rounded-xl border border-[#3D444D] bg-[#151B23] px-3 text-sm text-[#C9D1D9] outline-none transition focus:border-[#58A6FF] cursor-pointer"
                            >
                                {getYearOptions().map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#C9D1D9] transition hover:bg-[#21262D] cursor-pointer"
                        >
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </section>

                <section className="space-y-2">
                    <div className="flex items-center justify-between md:hidden">
                        <p className="text-xs text-[#8B949E]">Overview</p>

                        <div className="flex items-center gap-2 text-xs text-[#6E7681]">
                            <span>Swipe to see more</span>
                        </div>
                    </div>

                    <div className="relative max-w-full overflow-hidden">
                        <div className="scrollbar-hide flex max-w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
                            <SummaryCard
                                title="Total Spent"
                                value={formatCurrency(data.summary.totalSpent)}
                                description={`${selectedMonthLabel} ${selectedYear}`}
                                icon={IndianRupee}
                            />

                            <SummaryCard
                                title="Highest Category"
                                value={highestCategory ? highestCategory.label : "No data"}
                                description={
                                    highestCategory
                                        ? `${formatCurrency(highestCategory.amount)} spent`
                                        : "No expenses this month"
                                }
                                icon={PieChart}
                            />

                            <SummaryCard
                                title="Subscriptions"
                                value={formatCurrency(
                                    data.summary.activeSubscriptionMonthlyCost
                                )}
                                description="Monthly active cost"
                                icon={CreditCard}
                            />

                            <SummaryCard
                                title="Daily Average"
                                value={formatCurrency(data.summary.averageDailySpend)}
                                description="Average spending per day"
                                icon={TrendingUp}
                            />
                        </div>

                        <div className="pointer-events-none absolute bottom-3 right-0 top-0 w-12 bg-linear-to-l from-[#010409] to-transparent md:hidden" />
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                                    <Layers size={18} />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold leading-tight text-white sm:text-lg">
                                        Spending by Category
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-[#8B949E] sm:text-sm">
                                        Category-wise expense breakdown for this month.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                {data.categoryBreakdown.length > 0 ? (
                                    data.categoryBreakdown.map((category) => (
                                        <div key={category.category}>
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {category.label}
                                                    </p>
                                                    <p className="text-xs text-[#8B949E]">
                                                        {category.percentage}% of total spending
                                                    </p>
                                                </div>

                                                <p className="text-sm font-semibold text-[#C9D1D9]">
                                                    {formatCurrency(category.amount)}
                                                </p>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                                                <div
                                                    className="h-full rounded-full bg-[#58A6FF]"
                                                    style={{
                                                        width: `${Math.min(category.percentage, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState
                                        title="No category data"
                                        description="Add expenses to see category spending breakdown."
                                    />
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                                    <Wallet size={18} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Budget Health
                                    </h2>
                                    <p className="text-sm text-[#8B949E]">
                                        Compare your spending with your monthly budget.
                                    </p>
                                </div>
                            </div>

                            {data.budgetStatus ? (
                                <div className="mt-5">
                                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                                        <span className="text-[#8B949E]">
                                            {formatCurrency(data.budgetStatus.totalSpent)} spent of{" "}
                                            {formatCurrency(data.budgetStatus.totalBudget)}
                                        </span>

                                        <span className="font-medium text-[#C9D1D9]">
                                            {data.budgetStatus.usedPercentage}%
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                                        <div
                                            className={`h-full rounded-full ${data.budgetStatus.isOverBudget
                                                    ? "bg-red-500"
                                                    : data.budgetStatus.usedPercentage >= 90
                                                        ? "bg-yellow-500"
                                                        : "bg-[#238636]"
                                                }`}
                                            style={{
                                                width: `${Math.min(
                                                    data.budgetStatus.usedPercentage,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                                        <div className="rounded-xl bg-[#151B23] px-3 py-3">
                                            <p className="text-[11px] text-[#8B949E]">Budget</p>
                                            <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                                                {formatCurrency(data.budgetStatus.totalBudget)}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-[#151B23] px-3 py-3">
                                            <p className="text-[11px] text-[#8B949E]">Spent</p>
                                            <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                                                {formatCurrency(data.budgetStatus.totalSpent)}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-[#151B23] px-3 py-3">
                                            <p className="text-[11px] text-[#8B949E]">
                                                {data.budgetStatus.remaining >= 0 ? "Left" : "Over"}
                                            </p>
                                            <p
                                                className={`mt-1 truncate text-sm font-semibold sm:text-base ${data.budgetStatus.remaining >= 0
                                                        ? "text-[#3FB950]"
                                                        : "text-red-400"
                                                    }`}
                                            >
                                                {formatCurrency(Math.abs(data.budgetStatus.remaining))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5">
                                    <EmptyState
                                        title="No monthly budget"
                                        description="Create a monthly budget to see budget health."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                                    <ReceiptText size={18} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Recent Expenses
                                    </h2>
                                    <p className="text-sm text-[#8B949E]">
                                        Latest expenses from this month.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {data.recentExpenses.length > 0 ? (
                                    data.recentExpenses.map((expense) => (
                                        <div
                                            key={expense.id}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-[#3D444D] bg-[#151B23] p-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white">
                                                    {expense.name}
                                                </p>
                                                <p className="text-xs text-[#8B949E]">
                                                    {expense.category} • {formatDate(expense.spentAt)}
                                                </p>
                                            </div>

                                            <p className="shrink-0 text-sm font-semibold text-white">
                                                {formatCurrency(expense.amount)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-[#8B949E]">
                                        No recent expenses for this month.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                            <h2 className="text-lg font-semibold text-white">
                                Smart Insights
                            </h2>
                            <p className="mt-1 text-sm text-[#8B949E]">
                                Rule-based alerts from your spending data.
                            </p>

                            <div className="mt-4 space-y-3">
                                {data.insights.map((insight, index) => {
                                    const style = getInsightStyle(insight.type);
                                    const Icon = style.icon;

                                    return (
                                        <div
                                            key={`${insight.title}-${index}`}
                                            className={`rounded-xl border p-3 ${style.className}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <Icon
                                                    size={16}
                                                    className={`mt-0.5 shrink-0 ${style.iconClassName}`}
                                                />

                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {insight.title}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 opacity-90">
                                                        {insight.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                            <div className="flex items-center gap-2">
                                <RefreshCcw size={18} className="text-[#58A6FF]" />
                                <h2 className="text-lg font-semibold text-white">
                                    Recurring Impact
                                </h2>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-[#151B23] p-3">
                                    <p className="text-xs text-[#8B949E]">Subscriptions</p>
                                    <p className="mt-1 text-base font-semibold text-white">
                                        {formatCurrency(
                                            data.summary.activeSubscriptionMonthlyCost
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-[#6E7681]">
                                        {data.summary.subscriptionShare}% of spend
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#151B23] p-3">
                                    <p className="text-xs text-[#8B949E]">Recurring</p>
                                    <p className="mt-1 text-base font-semibold text-white">
                                        {formatCurrency(data.summary.recurringMonthlyCost)}
                                    </p>
                                    <p className="mt-1 text-xs text-[#6E7681]">
                                        {data.summary.recurringShare}% of spend
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-[#58A6FF]" />
                                <h2 className="text-lg font-semibold text-white">
                                    Upcoming Subscriptions
                                </h2>
                            </div>

                            <div className="mt-4 space-y-3">
                                {data.upcomingSubscriptions.length > 0 ? (
                                    data.upcomingSubscriptions.map((subscription) => (
                                        <div
                                            key={subscription.id}
                                            className="rounded-xl border border-[#3D444D] bg-[#151B23] p-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-white">
                                                        {subscription.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#8B949E]">
                                                        {formatBillingCycle(subscription.billingCycle)} •{" "}
                                                        {formatDate(subscription.nextRenewalDate)}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-sm font-semibold text-white">
                                                    {formatCurrency(subscription.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-[#8B949E]">
                                        No upcoming subscriptions found.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                            <div className="flex items-center gap-2">
                                <CalendarDays size={18} className="text-[#58A6FF]" />
                                <h2 className="text-lg font-semibold text-white">
                                    Upcoming Recurring
                                </h2>
                            </div>

                            <div className="mt-4 space-y-3">
                                {data.upcomingRecurringExpenses.length > 0 ? (
                                    data.upcomingRecurringExpenses.map((recurring) => (
                                        <div
                                            key={recurring.id}
                                            className="rounded-xl border border-[#3D444D] bg-[#151B23] p-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-white">
                                                        {recurring.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#8B949E]">
                                                        {formatBillingCycle(recurring.billingCycle)} •{" "}
                                                        {formatDate(recurring.nextDueDate)}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-sm font-semibold text-white">
                                                    {formatCurrency(recurring.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-[#8B949E]">
                                        No upcoming recurring expenses found.
                                    </p>
                                )}
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    );
}