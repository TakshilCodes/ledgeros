"use client";

import type { InsightsData } from "@/actions/insights/get-insights";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { EmptyState } from "@/components/ui/foundation";
import { StyledSelect } from "@/components/ui/select";
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

type Props = {
  data: InsightsData;
  selectedMonth: number;
  selectedYear: number;
};

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
  return month === 1
    ? { month: 12, year: year - 1 }
    : { month: month - 1, year };
}

function getNextMonth(month: number, year: number) {
  return month === 12
    ? { month: 1, year: year + 1 }
    : { month: month + 1, year };
}

function getInsightStyle(type: string) {
  if (type === "danger") {
    return { icon: AlertTriangle, iconClassName: "text-red-400" };
  }
  if (type === "warning") {
    return { icon: AlertTriangle, iconClassName: "text-amber-400" };
  }
  if (type === "success") {
    return { icon: CheckCircle2, iconClassName: "text-green-400" };
  }
  return { icon: Info, iconClassName: "text-blue-400" };
}

function getBudgetProgressClass(percentage: number, isOverBudget: boolean) {
  if (isOverBudget || percentage > 90) return "bg-red-500";
  if (percentage >= 70) return "bg-amber-500";
  return "bg-primary";
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-blue-400">
        <Icon size={15} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
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
    "Current month";

  function updateParams(params: { month?: number; year?: number }) {
    const searchParams = new URLSearchParams();
    searchParams.set("month", String(params.month ?? selectedMonth));
    searchParams.set("year", String(params.year ?? selectedYear));
    router.replace(`${pathname}?${searchParams.toString()}`);
  }

  if (!data) {
    return (
      <EmptyState
        icon={Info}
        title="Unable to load insights"
        description="Something went wrong while loading your insights."
        className="border-0 bg-card py-10"
      />
    );
  }

  const highestCategory = data.summary.highestCategory;
  const summaryItems = [
    {
      label: "Total spent",
      value: formatCurrency(data.summary.totalSpent),
      supportingText: `${selectedMonthLabel} ${selectedYear}`,
      icon: IndianRupee,
    },
    {
      label: "Highest category",
      value: highestCategory?.label || "No data",
      supportingText: highestCategory
        ? `${formatCurrency(highestCategory.amount)} / ${highestCategory.percentage}%`
        : "No expenses this month",
      icon: PieChart,
    },
    {
      label: "Subscriptions",
      value: formatCurrency(data.summary.activeSubscriptionMonthlyCost),
      supportingText: "Monthly active cost",
      icon: CreditCard,
    },
    {
      label: "Daily average",
      value: formatCurrency(data.summary.averageDailySpend),
      supportingText: "Average spend per day",
      icon: TrendingUp,
    },
  ];

  return (
    <main className="w-full min-w-0 space-y-4 text-foreground">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Spending analysis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Understand where your money went in {selectedMonthLabel} {selectedYear}.
          </p>
        </div>

        <div className="flex w-full min-w-0 items-center gap-1 rounded-lg border border-border bg-card p-1 lg:w-auto">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => updateParams(getPreviousMonth(selectedMonth, selectedYear))}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <StyledSelect
            aria-label="Insights month"
            value={selectedMonth}
            onChange={(event) => updateParams({ month: Number(event.target.value) })}
            className="h-8 min-w-0 flex-1 border-0 bg-transparent sm:w-32 sm:flex-none"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </StyledSelect>
          <StyledSelect
            aria-label="Insights year"
            value={selectedYear}
            onChange={(event) => updateParams({ year: Number(event.target.value) })}
            className="h-8 w-20 border-0 bg-transparent sm:w-24"
          >
            {getYearOptions().map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </StyledSelect>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => updateParams(getNextMonth(selectedMonth, selectedYear))}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <FinancialSummary items={summaryItems} />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="px-4 py-4 sm:px-5">
            <SectionHeading
              icon={Layers}
              title="Spending by category"
              description="Category breakdown for the selected month."
            />

            {data.categoryBreakdown.length > 0 ? (
              <div className="mt-4 space-y-3.5">
                {data.categoryBreakdown.map((category) => (
                  <div key={category.category}>
                    <div className="mb-1.5 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {category.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.percentage}% of spending
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        {formatCurrency(category.amount)}
                      </p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-accent">
                      <div
                        className="h-full rounded-full bg-blue-400"
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Layers}
                title="No category data"
                description="Add expenses to see your category breakdown."
                className="mt-3 border-0 py-8"
              />
            )}
          </div>

          <div className="border-t border-border/70 px-4 py-4 sm:px-5">
            <SectionHeading
              icon={Wallet}
              title="Budget health"
              description="Monthly spending compared with your budget."
            />

            {data.budgetStatus ? (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-muted-foreground">
                    {formatCurrency(data.budgetStatus.totalSpent)} of{" "}
                    {formatCurrency(data.budgetStatus.totalBudget)}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-foreground">
                    {data.budgetStatus.usedPercentage}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-accent">
                  <div
                    className={`h-full rounded-full ${getBudgetProgressClass(
                      data.budgetStatus.usedPercentage,
                      data.budgetStatus.isOverBudget
                    )}`}
                    style={{
                      width: `${Math.min(data.budgetStatus.usedPercentage, 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 divide-x divide-border/70">
                  <div className="pr-3">
                    <p className="text-[11px] text-muted-foreground">Budget</p>
                    <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(data.budgetStatus.totalBudget)}
                    </p>
                  </div>
                  <div className="px-3">
                    <p className="text-[11px] text-muted-foreground">Spent</p>
                    <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(data.budgetStatus.totalSpent)}
                    </p>
                  </div>
                  <div className="pl-3">
                    <p className="text-[11px] text-muted-foreground">
                      {data.budgetStatus.remaining >= 0 ? "Remaining" : "Over"}
                    </p>
                    <p className={`mt-0.5 truncate text-sm font-semibold tabular-nums ${
                      data.budgetStatus.remaining >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {formatCurrency(Math.abs(data.budgetStatus.remaining))}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-muted/45 px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">No monthly budget</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Create one to compare spending against a limit.
                  </p>
                </div>
                <Info className="size-4 shrink-0 text-blue-400" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="border-t border-border/70">
            <div className="px-4 py-3 sm:px-5">
              <SectionHeading
                icon={ReceiptText}
                title="Recent expenses"
                description="Latest activity from this month."
              />
            </div>
            {data.recentExpenses.length > 0 ? (
              <div className="divide-y divide-border/60 border-t border-border/60 px-4 sm:px-5">
                {data.recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {expense.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {expense.category} <span aria-hidden="true">/</span>{" "}
                        {formatDate(expense.spentAt)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="border-t border-border/60 px-5 py-5 text-sm text-muted-foreground">
                No recent expenses for this month.
              </p>
            )}
          </div>
        </section>

        <aside className="self-start overflow-hidden rounded-xl border border-border/70 bg-card">
          <section className="px-4 py-4">
            <h2 className="text-sm font-semibold text-foreground">Smart insights</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Alerts based on your current spending.
            </p>
            {data.insights.length > 0 ? (
              <div className="mt-3 divide-y divide-border/60">
                {data.insights.map((insight, index) => {
                  const style = getInsightStyle(insight.type);
                  const Icon = style.icon;
                  return (
                    <div
                      key={`${insight.title}-${index}`}
                      className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0"
                    >
                      <Icon
                        size={15}
                        aria-hidden="true"
                        className={`mt-0.5 shrink-0 ${style.iconClassName}`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {insight.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                No insights available for this month.
              </p>
            )}
          </section>

          <section className="border-t border-border/70 px-4 py-4">
            <div className="flex items-center gap-2">
              <RefreshCcw size={15} className="text-blue-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">Recurring impact</h2>
            </div>
            <div className="mt-3 grid grid-cols-2 divide-x divide-border/70">
              <div className="pr-3">
                <p className="text-xs text-muted-foreground">Subscriptions</p>
                <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
                  {formatCurrency(data.summary.activeSubscriptionMonthlyCost)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {data.summary.subscriptionShare}% of spend
                </p>
              </div>
              <div className="pl-3">
                <p className="text-xs text-muted-foreground">Recurring</p>
                <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
                  {formatCurrency(data.summary.recurringMonthlyCost)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {data.summary.recurringShare}% of spend
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-border/70">
            <div className="flex items-center gap-2 px-4 py-3">
              <Clock size={15} className="text-blue-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">
                Upcoming payments
              </h2>
            </div>

            <div className="border-t border-border/60 px-4 py-3">
              <div className="mb-1.5 flex items-center gap-2">
                <CreditCard size={13} className="text-muted-foreground" aria-hidden="true" />
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Subscriptions
                </h3>
              </div>
              {data.upcomingSubscriptions.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {data.upcomingSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">
                          {subscription.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatBillingCycle(subscription.billingCycle)} /{" "}
                          {formatDate(subscription.nextRenewalDate)}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                        {formatCurrency(subscription.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-xs text-muted-foreground">
                  No upcoming subscriptions.
                </p>
              )}
            </div>

            <div className="border-t border-border/60 px-4 py-3">
              <div className="mb-1.5 flex items-center gap-2">
                <CalendarDays size={13} className="text-muted-foreground" aria-hidden="true" />
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recurring
                </h3>
              </div>
              {data.upcomingRecurringExpenses.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {data.upcomingRecurringExpenses.map((recurring) => (
                    <div key={recurring.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">
                          {recurring.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatBillingCycle(recurring.billingCycle)} /{" "}
                          {formatDate(recurring.nextDueDate)}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                        {formatCurrency(recurring.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-xs text-muted-foreground">
                  No upcoming recurring expenses.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
