"use client";

import { deleteBudget } from "@/actions/budgets/delete-budget";
import AddBudgetModal from "@/components/budget/add-budget-modal";
import EditBudgetModal from "@/components/budget/edit-budget-modal";
import { useBudgetModalStore } from "@/store/budget-modal-store";
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Edit,
    IndianRupee,
    MoreVertical,
    PiggyBank,
    Plus,
    Target,
    Trash2,
    TrendingDown,
    Wallet,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ElementType, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

type BudgetType = "MONTHLY" | "CATEGORY" | "DAILY_LIMIT";
type BudgetFilterType = "ALL" | BudgetType;

type Budget = {
    id: string;
    name: string;
    type: BudgetType;
    category: string | null;
    amount: number;
    spent: number;
    remaining?: number;
    usedPercentage?: number;
    status?: string;
    insight?: string;
    month: number;
    year: number;
};

type BudgetStats = {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    budgetHealth: number;
    safeDailySpend: number;
    daysLeft: number;
    month: number;
    year: number;
} | null;

type Props = {
    budgets: Budget[];
    stats: BudgetStats;
    selectedMonth: number;
    selectedYear: number;
    selectedType: BudgetFilterType;
};

const budgetTypes: {
    label: string;
    value: BudgetFilterType;
}[] = [
        {
            label: "All Types",
            value: "ALL",
        },
        {
            label: "Monthly",
            value: "MONTHLY",
        },
        {
            label: "Category",
            value: "CATEGORY",
        },
        {
            label: "Daily Limit",
            value: "DAILY_LIMIT",
        },
    ];

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

function formatBudgetType(type: string) {
    if (type === "MONTHLY") return "Monthly";
    if (type === "CATEGORY") return "Category";
    if (type === "DAILY_LIMIT") return "Daily Limit";

    return type;
}

function formatCategory(category: string | null) {
    if (!category) return "All spending";

    return category
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function getUsedPercentage(spent: number, amount: number) {
    if (amount <= 0) return 0;

    return Math.round((spent / amount) * 100);
}

function getBudgetStatus(spent: number, amount: number) {
    const percentage = getUsedPercentage(spent, amount);

    if (percentage >= 100) {
        return {
            label: "Over Budget",
            className: "border-red-500/30 bg-red-500/10 text-red-400",
            progressClassName: "bg-red-500",
            icon: AlertTriangle,
        };
    }

    if (percentage >= 90) {
        return {
            label: "Near Limit",
            className: "border-orange-500/30 bg-orange-500/10 text-orange-400",
            progressClassName: "bg-orange-500",
            icon: AlertTriangle,
        };
    }

    if (percentage >= 70) {
        return {
            label: "Watch",
            className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
            progressClassName: "bg-yellow-500",
            icon: AlertTriangle,
        };
    }

    return {
        label: "Healthy",
        className: "border-[#238636]/30 bg-[#238636]/10 text-[#3FB950]",
        progressClassName: "bg-[#238636]",
        icon: CheckCircle2,
    };
}

function getBudgetInsight(budget: Budget) {
    if (budget.insight) return budget.insight;

    const percentage = getUsedPercentage(budget.spent, budget.amount);
    const remaining = budget.amount - budget.spent;

    if (percentage >= 100) {
        return `${budget.name} is over budget by ${formatCurrency(
            Math.abs(remaining)
        )}.`;
    }

    if (percentage >= 90) {
        return `${budget.name} is close to the limit. You have used ${percentage}% of this budget.`;
    }

    if (percentage >= 70) {
        return `${budget.name} has used ${percentage}% of its budget. Keep an eye on spending.`;
    }

    return `${budget.name} looks healthy. You still have ${formatCurrency(
        remaining
    )} left.`;
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

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: ElementType;
}) {
    return (
        <div className="min-w-57.5 snap-start rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 shadow-sm md:min-w-0 md:flex-1">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-[#8B949E]">{title}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
                    <p className="mt-1 text-xs text-[#6E7681]">{description}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
}

function BudgetProgress({ spent, amount }: { spent: number; amount: number }) {
    const percentage = getUsedPercentage(spent, amount);
    const status = getBudgetStatus(spent, amount);
    const width = Math.min(percentage, 100);

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#8B949E]">
                    {formatCurrency(spent)} spent of {formatCurrency(amount)}
                </span>
                <span className="font-medium text-[#C9D1D9]">{percentage}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                <div
                    className={`h-full rounded-full ${status.progressClassName}`}
                    style={{
                        width: `${width}%`,
                    }}
                />
            </div>
        </div>
    );
}

function BudgetCard({
    budget,
    onEdit,
    onDelete,
    isDeleting,
}: {
    budget: Budget;
    onEdit: (budget: Budget) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const remaining = budget.amount - budget.spent;
    const percentage = getUsedPercentage(budget.spent, budget.amount);
    const status = getBudgetStatus(budget.spent, budget.amount);
    const StatusIcon = status.icon;

    return (
        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 transition hover:border-[#58A6FF]/40">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                        {budget.type === "MONTHLY" ? (
                            <Wallet size={19} />
                        ) : budget.type === "DAILY_LIMIT" ? (
                            <CalendarDays size={19} />
                        ) : (
                            <Target size={19} />
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-white">
                                {budget.name}
                            </h3>

                            <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}
                            >
                                <StatusIcon size={12} />
                                {status.label}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-[#8B949E]">
                            {formatBudgetType(budget.type)} • {formatCategory(budget.category)}
                        </p>
                    </div>
                </div>

                <div className="relative shrink-0">
                    {isMenuOpen ? (
                        <button
                            type="button"
                            aria-label="Close budget menu"
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 z-40 cursor-default bg-transparent"
                        />
                    ) : null}

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="relative z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#C9D1D9] transition hover:bg-[#21262D]"
                    >
                        <MoreVertical size={17} />
                    </button>

                    {isMenuOpen ? (
                        <div className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-xl border border-[#3D444D] bg-[#151B23] shadow-2xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onEdit(budget);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-[#C9D1D9] hover:bg-[#21262D]"
                            >
                                <Edit size={15} />
                                Edit
                            </button>

                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onDelete(budget.id);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 size={15} />
                                Delete
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-5">
                <BudgetProgress spent={budget.spent} amount={budget.amount} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="min-w-0 rounded-xl bg-[#151B23] px-3 py-3 sm:px-4 sm:py-4">
                    <p className="truncate text-[11px] text-[#8B949E] sm:text-xs">
                        Budget
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                        {formatCurrency(budget.amount)}
                    </p>
                </div>

                <div className="min-w-0 rounded-xl bg-[#151B23] px-3 py-3 sm:px-4 sm:py-4">
                    <p className="truncate text-[11px] text-[#8B949E] sm:text-xs">
                        Spent
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                        {formatCurrency(budget.spent)}
                    </p>
                </div>

                <div className="min-w-0 rounded-xl bg-[#151B23] px-3 py-3 sm:px-4 sm:py-4">
                    <p className="truncate text-[11px] text-[#8B949E] sm:text-xs">
                        {remaining >= 0 ? "Left" : "Over"}
                    </p>
                    <p
                        className={`mt-1 truncate text-sm font-semibold sm:text-base ${remaining >= 0 ? "text-[#3FB950]" : "text-red-400"
                            }`}
                    >
                        {formatCurrency(Math.abs(remaining))}
                    </p>
                </div>
            </div>

            <p
                className={`mt-4 text-sm ${percentage >= 100 ? "text-red-400" : "text-[#8B949E]"
                    }`}
            >
                {getBudgetInsight(budget)}
            </p>
        </div>
    );
}

export default function BudgetClient({
    budgets,
    stats,
    selectedMonth,
    selectedYear,
    selectedType,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const { onOpen, onEditOpen } = useBudgetModalStore();

    const [isPending, startTransition] = useTransition();
    const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);

    const monthlyBudget = budgets.find((budget) => budget.type === "MONTHLY");
    const dailyLimitBudget = budgets.find(
        (budget) => budget.type === "DAILY_LIMIT"
    );
    const categoryBudgets = budgets.filter((budget) => budget.type === "CATEGORY");

    const fallbackStats = useMemo(() => {
        const totalBudget = budgets.reduce((total, budget) => {
            if (budget.type === "DAILY_LIMIT") return total;

            return total + budget.amount;
        }, 0);

        const totalSpent = budgets.reduce((total, budget) => {
            if (budget.type === "DAILY_LIMIT") return total;

            return total + budget.spent;
        }, 0);

        const totalRemaining = totalBudget - totalSpent;
        const budgetHealth = getUsedPercentage(totalSpent, totalBudget);

        return {
            totalBudget,
            totalSpent,
            totalRemaining,
            budgetHealth,
            safeDailySpend: 0,
            daysLeft: 0,
            month: selectedMonth,
            year: selectedYear,
        };
    }, [budgets, selectedMonth, selectedYear]);

    const budgetStats = stats || fallbackStats;

    const selectedMonthLabel =
        monthOptions.find((month) => month.value === selectedMonth)?.label ||
        "Current Month";

    function updateParams(params: {
        month?: number;
        year?: number;
        type?: BudgetFilterType;
    }) {
        const searchParams = new URLSearchParams();

        searchParams.set("month", String(params.month ?? selectedMonth));
        searchParams.set("year", String(params.year ?? selectedYear));

        const nextType = params.type ?? selectedType;

        if (nextType !== "ALL") {
            searchParams.set("type", nextType);
        }

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

    function handleDeleteBudget(id: string) {
        const confirmed = confirm(
            "Delete this budget?\n\nThis will only delete the budget limit, not your expenses."
        );

        if (!confirmed) return;

        setDeletingBudgetId(id);

        startTransition(async () => {
            const result = await deleteBudget(id);

            if (!result.ok) {
                toast.error(result.error || "Failed to delete budget");
                setDeletingBudgetId(null);
                return;
            }

            toast.success(result.message || "Budget deleted successfully");
            setDeletingBudgetId(null);
            router.refresh();
        });
    }

    function handleEditBudget(budget: Budget) {
        onEditOpen({
            id: budget.id,
            name: budget.name,
            type: budget.type,
            category: budget.category,
            amount: budget.amount,
            month: budget.month,
            year: budget.year,
        });
    }

    return (
        <>
            <main className="min-h-screen bg-[#010409] px-4 py-6 text-[#C9D1D9] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            
                            <button
                                type="button"
                                onClick={onOpen}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 text-sm font-semibold text-white transition hover:bg-[#2EA043]"
                            >
                                <Plus size={17} />
                                Add Budget
                            </button>

                            <div className="flex items-center gap-2 rounded-2xl border border-[#3D444D] bg-[#0D1117] p-2">
                                <button
                                    type="button"
                                    onClick={handlePreviousMonth}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#C9D1D9] transition hover:bg-[#21262D]"
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
                                        className="h-10 min-w-[120px] rounded-xl border border-[#3D444D] bg-[#151B23] px-3 text-sm text-[#C9D1D9] outline-none transition focus:border-[#58A6FF]"
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
                                        className="h-10 min-w-[96px] rounded-xl border border-[#3D444D] bg-[#151B23] px-3 text-sm text-[#C9D1D9] outline-none transition focus:border-[#58A6FF]"
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
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#C9D1D9] transition hover:bg-[#21262D]"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <div className="flex items-center justify-between md:hidden">
                            <p className="text-xs text-[#8B949E]">Overview</p>

                            <div className="flex items-center gap-2 text-xs text-[#6E7681]">
                                <span>Swipe to see more</span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
                                <SummaryCard
                                    title="Total Budget"
                                    value={formatCurrency(budgetStats.totalBudget)}
                                    description="Monthly + category limits"
                                    icon={PiggyBank}
                                />

                                <SummaryCard
                                    title="Total Spent"
                                    value={formatCurrency(budgetStats.totalSpent)}
                                    description={`${budgetStats.budgetHealth}% of total budget used`}
                                    icon={IndianRupee}
                                />

                                <SummaryCard
                                    title={budgetStats.totalRemaining >= 0 ? "Remaining" : "Over Budget"}
                                    value={formatCurrency(Math.abs(budgetStats.totalRemaining))}
                                    description={
                                        budgetStats.totalRemaining >= 0
                                            ? "Available this month"
                                            : "Amount exceeded"
                                    }
                                    icon={Wallet}
                                />

                                <SummaryCard
                                    title="Safe Daily Spend"
                                    value={formatCurrency(budgetStats.safeDailySpend)}
                                    description={`${budgetStats.daysLeft} days left this month`}
                                    icon={TrendingDown}
                                />
                            </div>

                            <div className="pointer-events-none absolute bottom-3 right-0 top-0 w-12 bg-linear-to-l from-[#010409] to-transparent md:hidden" />
                        </div>
                    </section>

                    {monthlyBudget ? (
                        <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                                        <Wallet size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-white sm:text-lg">
                                            Monthly Budget Overview
                                        </h2>
                                        <p className="mt-1 text-xs leading-5 text-[#8B949E] sm:text-sm">
                                            Your main spending limit for this month.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-[#3D444D] bg-[#151B23] px-3 py-3 sm:hidden">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs text-[#8B949E]">Safe daily spend</p>
                                    <p className="text-base font-semibold text-[#3FB950]">
                                        {formatCurrency(budgetStats.safeDailySpend)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 hidden rounded-xl border border-[#3D444D] bg-[#151B23] px-4 py-3 sm:block">
                                <p className="text-xs text-[#8B949E]">Safe daily spend</p>
                                <p className="mt-1 text-xl font-semibold text-[#3FB950]">
                                    {formatCurrency(budgetStats.safeDailySpend)}
                                </p>
                            </div>

                            <div className="mt-4">
                                <BudgetProgress
                                    spent={monthlyBudget.spent}
                                    amount={monthlyBudget.amount}
                                />
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                                <div className="rounded-xl bg-[#151B23] px-3 py-3 sm:px-4 sm:py-4">
                                    <p className="text-[11px] text-[#8B949E] sm:text-xs">
                                        Limit
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-white sm:text-lg">
                                        {formatCurrency(monthlyBudget.amount)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#151B23] px-3 py-3 sm:px-4 sm:py-4">
                                    <p className="text-[11px] text-[#8B949E] sm:text-xs">
                                        Spent
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-white sm:text-lg">
                                        {formatCurrency(monthlyBudget.spent)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#151B23] px-3 py-3 sm:px-4 sm:py-4">
                                    <p className="text-[11px] text-[#8B949E] sm:text-xs">
                                        {monthlyBudget.amount - monthlyBudget.spent >= 0
                                            ? "Left"
                                            : "Over"}
                                    </p>
                                    <p
                                        className={`mt-1 text-sm font-semibold sm:text-lg ${monthlyBudget.amount - monthlyBudget.spent >= 0
                                            ? "text-[#3FB950]"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {formatCurrency(
                                            Math.abs(monthlyBudget.amount - monthlyBudget.spent)
                                        )}
                                    </p>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    All Budgets
                                </h2>
                                <p className="text-sm text-[#8B949E]">
                                    Manage monthly, category, and daily spending limits.
                                </p>
                            </div>

                            <select
                                value={selectedType}
                                onChange={(event) =>
                                    updateParams({
                                        type: event.target.value as BudgetFilterType,
                                    })
                                }
                                className="h-11 rounded-xl border border-[#3D444D] bg-[#151B23] px-3 text-sm text-[#C9D1D9] outline-none transition focus:border-[#58A6FF]"
                            >
                                {budgetTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-4">
                            {budgets.length > 0 ? (
                                budgets.map((budget) => (
                                    <BudgetCard
                                        key={budget.id}
                                        budget={budget}
                                        onEdit={handleEditBudget}
                                        onDelete={handleDeleteBudget}
                                        isDeleting={isPending && deletingBudgetId === budget.id}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-[#3D444D] bg-[#0D1117] p-8 text-center">
                                    <h3 className="text-base font-semibold text-white">
                                        No budgets found
                                    </h3>
                                    <p className="mt-2 text-sm text-[#8B949E]">
                                        Create your first budget to start controlling your spending.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={onOpen}
                                        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 text-sm font-semibold text-white transition hover:bg-[#2EA043]"
                                    >
                                        <Plus size={17} />
                                        Add Budget
                                    </button>
                                </div>
                            )}
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                                <h2 className="text-lg font-semibold text-white">
                                    Budget Insights
                                </h2>
                                <p className="mt-1 text-sm text-[#8B949E]">
                                    Simple rule-based alerts from your spending.
                                </p>

                                <div className="mt-4 space-y-3">
                                    {budgets.length > 0 ? (
                                        budgets.slice(0, 4).map((budget) => {
                                            const status = getBudgetStatus(
                                                budget.spent,
                                                budget.amount
                                            );
                                            const StatusIcon = status.icon;

                                            return (
                                                <div
                                                    key={budget.id}
                                                    className="rounded-xl border border-[#3D444D] bg-[#151B23] p-3"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <StatusIcon
                                                            size={16}
                                                            className={
                                                                status.label === "Healthy"
                                                                    ? "mt-0.5 text-[#3FB950]"
                                                                    : "mt-0.5 text-yellow-400"
                                                            }
                                                        />

                                                        <p className="text-sm text-[#C9D1D9]">
                                                            {getBudgetInsight(budget)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-[#8B949E]">
                                            Add budgets to see spending insights.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {dailyLimitBudget ? (
                                <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                                            <CalendarDays size={18} />
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-semibold text-white">
                                                Daily Limit
                                            </h2>
                                            <p className="text-sm text-[#8B949E]">
                                                Today&apos;s spending control.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <BudgetProgress
                                            spent={dailyLimitBudget.spent}
                                            amount={dailyLimitBudget.amount}
                                        />
                                    </div>

                                    <div className="mt-4 rounded-xl bg-[#151B23] p-4">
                                        <p className="text-xs text-[#8B949E]">Today remaining</p>
                                        <p className="mt-1 text-xl font-semibold text-[#3FB950]">
                                            {formatCurrency(
                                                Math.max(
                                                    dailyLimitBudget.amount - dailyLimitBudget.spent,
                                                    0
                                                )
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                                <h2 className="text-lg font-semibold text-white">
                                    Category Budgets
                                </h2>
                                <p className="mt-1 text-sm text-[#8B949E]">
                                    Quick overview by category.
                                </p>

                                <div className="mt-4 space-y-3">
                                    {categoryBudgets.length > 0 ? (
                                        categoryBudgets.map((budget) => {
                                            const percentage = getUsedPercentage(
                                                budget.spent,
                                                budget.amount
                                            );

                                            return (
                                                <div key={budget.id}>
                                                    <div className="mb-1 flex items-center justify-between gap-3">
                                                        <p className="text-sm text-[#C9D1D9]">
                                                            {formatCategory(budget.category)}
                                                        </p>
                                                        <p className="text-xs text-[#8B949E]">
                                                            {percentage}%
                                                        </p>
                                                    </div>

                                                    <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                                                        <div
                                                            className="h-full rounded-full bg-[#58A6FF]"
                                                            style={{
                                                                width: `${Math.min(percentage, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-[#8B949E]">
                                            No category budgets added yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </section>
                </div>
            </main>

            <AddBudgetModal />
            <EditBudgetModal />
        </>
    );
}