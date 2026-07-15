"use client";

import { deleteBudget } from "@/actions/budgets/delete-budget";
import AddBudgetModal from "@/components/budget/add-budget-modal";
import EditBudgetModal from "@/components/budget/edit-budget-modal";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { EmptyState, FilterBar, StatusBadge } from "@/components/ui/foundation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudgetModalStore } from "@/store/budget-modal-store";
import {
  AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight,
  Edit, IndianRupee, MoreVertical, PiggyBank, Plus, Target, Trash2,
  TrendingDown, Wallet,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

type BudgetType = "MONTHLY" | "CATEGORY" | "DAILY_LIMIT";
type BudgetFilterType = "ALL" | BudgetType;
type Budget = {
  id: string; name: string; type: BudgetType; category: string | null;
  amount: number; spent: number; remaining?: number; usedPercentage?: number;
  status?: string; insight?: string; month: number; year: number;
};
type BudgetStats = {
  totalBudget: number; totalSpent: number; totalRemaining: number;
  budgetHealth: number; safeDailySpend: number; daysLeft: number;
  month: number; year: number;
} | null;
type Props = {
  budgets: Budget[]; stats: BudgetStats; selectedMonth: number;
  selectedYear: number; selectedType: BudgetFilterType;
};

const budgetTypes: { label: string; value: BudgetFilterType }[] = [
  { label: "All types", value: "ALL" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Category", value: "CATEGORY" },
  { label: "Daily limit", value: "DAILY_LIMIT" },
];
const monthOptions = [
  { label: "January", value: 1 }, { label: "February", value: 2 },
  { label: "March", value: 3 }, { label: "April", value: 4 },
  { label: "May", value: 5 }, { label: "June", value: 6 },
  { label: "July", value: 7 }, { label: "August", value: 8 },
  { label: "September", value: 9 }, { label: "October", value: 10 },
  { label: "November", value: 11 }, { label: "December", value: 12 },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount);
}
function formatBudgetType(type: BudgetType) {
  if (type === "MONTHLY") return "Monthly";
  if (type === "CATEGORY") return "Category";
  return "Daily limit";
}
function formatCategory(category: string | null) {
  if (!category) return "All spending";
  return category.split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ");
}
function getUsedPercentage(spent: number, amount: number) {
  if (amount <= 0) return 0;
  return Math.round((spent / amount) * 100);
}
function getBudgetStatus(spent: number, amount: number) {
  const percentage = getUsedPercentage(spent, amount);
  if (percentage > 100) return {
    label: "Over budget", tone: "danger" as const,
    progressClassName: "bg-red-500", icon: AlertTriangle,
  };
  if (percentage >= 90) return {
    label: percentage === 100 ? "Limit reached" : "Near limit",
    tone: "danger" as const, progressClassName: "bg-red-500", icon: AlertTriangle,
  };
  if (percentage >= 70) return {
    label: "Watch", tone: "warning" as const,
    progressClassName: "bg-amber-500", icon: AlertTriangle,
  };
  return {
    label: "Healthy", tone: "success" as const,
    progressClassName: "bg-primary", icon: CheckCircle2,
  };
}
function getBudgetInsight(budget: Budget) {
  if (budget.insight) return budget.insight;
  const percentage = getUsedPercentage(budget.spent, budget.amount);
  const remaining = budget.amount - budget.spent;
  if (percentage > 100) return `${budget.name} is over budget by ${formatCurrency(Math.abs(remaining))}.`;
  if (percentage >= 90) return `${budget.name} is close to the limit at ${percentage}% used.`;
  if (percentage >= 70) return `${budget.name} has used ${percentage}% of its budget.`;
  return `${formatCurrency(remaining)} remains in ${budget.name}.`;
}
function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => currentYear - 1 + index);
}
function getPreviousMonth(month: number, year: number) {
  return month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
}
function getNextMonth(month: number, year: number) {
  return month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year };
}
function BudgetProgress({ spent, amount, compact = false }: {
  spent: number; amount: number; compact?: boolean;
}) {
  const percentage = getUsedPercentage(spent, amount);
  const status = getBudgetStatus(spent, amount);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="truncate text-muted-foreground">
          {formatCurrency(spent)} of {formatCurrency(amount)}
        </span>
        <span className="shrink-0 font-medium text-foreground">{percentage}%</span>
      </div>
      <div className={`${compact ? "h-1.5" : "h-2"} overflow-hidden rounded-full bg-accent`}>
        <div className={`h-full rounded-full transition-[width] duration-200 ${status.progressClassName}`}
          style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}

function BudgetRow({ budget, onEdit, onDelete, isDeleting }: {
  budget: Budget; onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void; isDeleting: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const remaining = budget.amount - budget.spent;
  const status = getBudgetStatus(budget.spent, budget.amount);
  const Icon = budget.type === "MONTHLY" ? Wallet
    : budget.type === "DAILY_LIMIT" ? CalendarDays : Target;

  return (
    <article className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5 lg:grid-cols-[minmax(12rem,1fr)_minmax(14rem,1.15fr)_minmax(12rem,.8fr)_auto] lg:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-blue-400">
          <Icon size={17} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{budget.name}</h3>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatBudgetType(budget.type)} <span aria-hidden="true">/</span>{" "}
            {formatCategory(budget.category)}
          </p>
        </div>
      </div>

      <BudgetProgress spent={budget.spent} amount={budget.amount} compact />

      <div className="grid grid-cols-3 gap-3 text-xs lg:grid-cols-1 lg:gap-0 lg:text-right">
        <div>
          <span className="text-muted-foreground lg:hidden">Budget</span>
          <p className="mt-0.5 font-semibold tabular-nums text-foreground lg:mt-0">
            {formatCurrency(budget.amount)}
          </p>
        </div>
        <div className="lg:hidden">
          <span className="text-muted-foreground">Spent</span>
          <p className="mt-0.5 font-medium tabular-nums text-foreground">
            {formatCurrency(budget.spent)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">{remaining >= 0 ? "Remaining" : "Over"}</span>
          <p className={`mt-0.5 font-medium tabular-nums ${remaining >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      </div>

      <div className="relative justify-self-end">
        {isMenuOpen ? (
          <button type="button" aria-label="Close budget actions"
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-transparent" />
        ) : null}
        <button type="button" aria-label={`Open actions for ${budget.name}`}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <MoreVertical size={17} aria-hidden="true" />
        </button>
        {isMenuOpen ? (
          <div role="menu" className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl">
            <button type="button" role="menuitem"
              onClick={() => { setIsMenuOpen(false); onEdit(budget); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Edit size={15} aria-hidden="true" /> Edit
            </button>
            <button type="button" role="menuitem" disabled={isDeleting}
              onClick={() => { setIsMenuOpen(false); onDelete(budget.id); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 size={15} aria-hidden="true" /> Delete
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function BudgetClient({
  budgets, stats, selectedMonth, selectedYear, selectedType,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { onOpen, onEditOpen } = useBudgetModalStore();
  const [isPending, startTransition] = useTransition();
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);

  const monthlyBudget = budgets.find((budget) => budget.type === "MONTHLY");
  const dailyLimitBudget = budgets.find((budget) => budget.type === "DAILY_LIMIT");
  const categoryBudgets = budgets.filter((budget) => budget.type === "CATEGORY");

  const fallbackStats = useMemo(() => {
    const totalBudget = budgets.reduce(
      (total, budget) => budget.type === "DAILY_LIMIT" ? total : total + budget.amount, 0
    );
    const totalSpent = budgets.reduce(
      (total, budget) => budget.type === "DAILY_LIMIT" ? total : total + budget.spent, 0
    );
    return {
      totalBudget, totalSpent, totalRemaining: totalBudget - totalSpent,
      budgetHealth: getUsedPercentage(totalSpent, totalBudget),
      safeDailySpend: 0, daysLeft: 0,
      month: selectedMonth, year: selectedYear,
    };
  }, [budgets, selectedMonth, selectedYear]);

  const budgetStats = stats || fallbackStats;
  const selectedMonthLabel =
    monthOptions.find((month) => month.value === selectedMonth)?.label || "Current month";

  function updateParams(params: {
    month?: number; year?: number; type?: BudgetFilterType;
  }) {
    const searchParams = new URLSearchParams();
    searchParams.set("month", String(params.month ?? selectedMonth));
    searchParams.set("year", String(params.year ?? selectedYear));
    const nextType = params.type ?? selectedType;
    if (nextType !== "ALL") searchParams.set("type", nextType);
    router.replace(`${pathname}?${searchParams.toString()}`);
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
      id: budget.id, name: budget.name, type: budget.type,
      category: budget.category, amount: budget.amount,
      month: budget.month, year: budget.year,
    });
  }

  const summaryItems = [
    {
      label: "Total budget", value: formatCurrency(budgetStats.totalBudget),
      supportingText: "Monthly and category limits", icon: PiggyBank,
      tone: "default" as const,
    },
    {
      label: "Total spent", value: formatCurrency(budgetStats.totalSpent),
      supportingText: `${budgetStats.budgetHealth}% of budget used`,
      icon: IndianRupee,
      tone: budgetStats.budgetHealth >= 90 ? ("danger" as const)
        : budgetStats.budgetHealth >= 70 ? ("warning" as const) : ("default" as const),
    },
    {
      label: budgetStats.totalRemaining >= 0 ? "Remaining" : "Over budget",
      value: formatCurrency(Math.abs(budgetStats.totalRemaining)),
      supportingText: budgetStats.totalRemaining >= 0 ? "Available this month" : "Amount exceeded",
      icon: Wallet,
      tone: budgetStats.totalRemaining >= 0 ? ("default" as const) : ("danger" as const),
    },
    {
      label: "Safe daily spend", value: formatCurrency(budgetStats.safeDailySpend),
      supportingText: `${budgetStats.daysLeft} days left`, icon: TrendingDown,
      tone: "default" as const,
    },
  ];

  return (
    <>
      <main className="w-full min-w-0 space-y-4 text-foreground">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Monthly budget overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan and monitor spending limits for {selectedMonthLabel} {selectedYear}.
            </p>
          </div>
          <button type="button" onClick={onOpen}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Plus size={16} aria-hidden="true" /> Add budget
          </button>
        </header>

        <FinancialSummary items={summaryItems} />

        <FilterBar className="p-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-1 rounded-lg border border-border bg-background p-1">
              <button type="button" aria-label="Previous month"
                onClick={() => updateParams(getPreviousMonth(selectedMonth, selectedYear))}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <Select
                value={String(selectedMonth)}
                onValueChange={(value) => updateParams({ month: Number(value) })}
              >
                <SelectTrigger aria-label="Budget month" className="h-8 flex-1 border-0 bg-transparent sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(selectedYear)}
                onValueChange={(value) => updateParams({ year: Number(value) })}
              >
                <SelectTrigger aria-label="Budget year" className="h-8 w-24 border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {getYearOptions().map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button type="button" aria-label="Next month"
                onClick={() => updateParams(getNextMonth(selectedMonth, selectedYear))}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <Select
              value={selectedType}
              onValueChange={(value) => updateParams({ type: value as BudgetFilterType })}
            >
              <SelectTrigger aria-label="Filter budgets by type" className="h-10 sm:ml-auto sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {budgetTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FilterBar>

        {monthlyBudget ? (
          <section className="rounded-xl border border-border/70 bg-card px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-green-400">
                  <Wallet size={17} aria-hidden="true" />
                </div>
                <div className="min-w-0">

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatCurrency(monthlyBudget.spent)} spent with{" "}
                    {formatCurrency(Math.abs(monthlyBudget.amount - monthlyBudget.spent))}{" "}
                    {monthlyBudget.amount >= monthlyBudget.spent ? "remaining" : "over"}
                  </p>
                </div>
              </div>
              <div className="min-w-0 flex-[1.35]">
                <BudgetProgress spent={monthlyBudget.spent} amount={monthlyBudget.amount} />
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-3 lg:block lg:min-w-28 lg:border-t-0 lg:border-l lg:py-1 lg:pl-4 lg:text-right">
                <span className="text-xs text-muted-foreground">Safe per day</span>
                <p className="font-semibold tabular-nums text-green-400">
                  {formatCurrency(budgetStats.safeDailySpend)}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-4 py-3 sm:px-5">
              <h2 className="text-base font-semibold text-foreground">All budgets</h2>
              <p className="text-xs text-muted-foreground">
                {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
              </p>
            </div>
            {budgets.length > 0 ? (
              <div className="divide-y divide-border/60">
                {budgets.map((budget) => (
                  <BudgetRow key={budget.id} budget={budget}
                    onEdit={handleEditBudget} onDelete={handleDeleteBudget}
                    isDeleting={isPending && deletingBudgetId === budget.id} />
                ))}
              </div>
            ) : (
              <EmptyState icon={PiggyBank} title="No budgets found"
                description="Create a budget to start tracking your spending limits."
                action={
                  <button type="button" onClick={onOpen}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Plus size={15} aria-hidden="true" /> Add budget
                  </button>
                } />
            )}
          </section>

          <aside className="self-start overflow-hidden rounded-xl border border-border/70 bg-card">
            <section className="px-4 py-4">
              <h2 className="text-sm font-semibold text-foreground">Budget insights</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Based on current spending.</p>
              <div className="mt-3 divide-y divide-border/60">
                {budgets.length > 0 ? budgets.slice(0, 4).map((budget) => {
                  const status = getBudgetStatus(budget.spent, budget.amount);
                  const StatusIcon = status.icon;
                  const iconColor = status.tone === "success" ? "text-green-400"
                    : status.tone === "warning" ? "text-amber-400" : "text-red-400";
                  return (
                    <div key={budget.id} className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0">
                      <StatusIcon size={15} aria-hidden="true"
                        className={`mt-0.5 shrink-0 ${iconColor}`} />
                      <p className="text-xs leading-5 text-muted-foreground">
                        {getBudgetInsight(budget)}
                      </p>
                    </div>
                  );
                }) : (
                  <p className="py-2 text-xs text-muted-foreground">
                    Add budgets to see spending insights.
                  </p>
                )}
              </div>
            </section>

            {dailyLimitBudget ? (
              <section className="border-t border-border/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Daily limit</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Today&apos;s spending control
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-green-400">
                    {formatCurrency(Math.max(dailyLimitBudget.amount - dailyLimitBudget.spent, 0))} left
                  </span>
                </div>
                <div className="mt-3">
                  <BudgetProgress spent={dailyLimitBudget.spent}
                    amount={dailyLimitBudget.amount} compact />
                </div>
              </section>
            ) : null}

            <section className="border-t border-border/70 px-4 py-4">
              <h2 className="text-sm font-semibold text-foreground">Category budgets</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Quick usage overview.</p>
              <div className="mt-3 space-y-3">
                {categoryBudgets.length > 0 ? categoryBudgets.map((budget) => (
                  <div key={budget.id}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="truncate text-xs text-foreground">
                        {formatCategory(budget.category)}
                      </p>
                      <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {getUsedPercentage(budget.spent, budget.amount)}%
                      </p>
                    </div>
                    <BudgetProgress spent={budget.spent} amount={budget.amount} compact />
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground">
                    No category budgets added yet.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <AddBudgetModal />
      <EditBudgetModal />
    </>
  );
}
