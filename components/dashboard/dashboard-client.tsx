"use client";

import {
  AlertTriangle,
  CalendarClock,
  Car,
  CreditCard,
  Flame,
  PiggyBank,
  ReceiptText,
  Utensils,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { FinancialSummary } from "./financial-summary";
import { SpendingDonutChart } from "./dashboard-charts";
import { Panel } from "@/components/ui/foundation";
import type { DashboardData } from "@/types/dashboard";

type Props = {
  data: DashboardData;
  selectedRange: string;
};

const categoryColors = [
  "#58A6FF",
  "#3FB950",
  "#F85149",
  "#D29922",
  "#A371F7",
  "#DB61A2",
  "#56D4DD",
];

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

function getRangeLabel(range: string) {
  return range === "last-month" ? "Last month" : "This month";
}

function EmptyBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function ProgressBar({
  value,
  color = "bg-blue-500",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-accent"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(Math.round(value), 100)}
    >
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default function DashboardClient({ data, selectedRange }: Props) {
  const session = useSession();
  const userName = session.data?.user?.name?.split(" ")[0] || "User";

  if (!data) {
    return (
      <EmptyBlock
        title="Unable to load dashboard"
        description="Something went wrong while loading your dashboard."
      />
    );
  }

  const hasMonthlyBudget = data.meta.hasMonthlyBudget;
  const monthSpend = data.summaryCards.thisMonthSpend.value;
  const budgetDifference = data.summaryCards.budgetLeft.value;
  const budgetAmount = hasMonthlyBudget
    ? data.summaryCards.budgetLeft.isOverBudget
      ? monthSpend - budgetDifference
      : monthSpend + budgetDifference
    : 0;
  const budgetRemaining = Math.max(budgetAmount - monthSpend, 0);
  const budgetUsedPercentage =
    budgetAmount > 0 ? Math.round((monthSpend / budgetAmount) * 100) : 0;
  const budgetTone =
    data.summaryCards.budgetLeft.isOverBudget || budgetUsedPercentage > 90
      ? "danger"
      : budgetUsedPercentage >= 70
        ? "warning"
        : "success";
  const budgetProgressColor =
    budgetTone === "danger"
      ? "bg-red-500"
      : budgetTone === "warning"
        ? "bg-amber-500"
        : "bg-green-500";

  const topCategory = data.expenseOverview.categoryBreakdown[0] ?? null;

  const summaryItems = [
    {
      label: data.summaryCards.todaySpend.title,
      value: data.summaryCards.todaySpend.formattedValue,
      supportingText: data.summaryCards.todaySpend.subtitle,
      icon: ReceiptText,
    },
    {
      label: data.summaryCards.thisMonthSpend.title,
      value: data.summaryCards.thisMonthSpend.formattedValue,
      supportingText: data.summaryCards.thisMonthSpend.subtitle,
      icon: Wallet,
    },
    {
      label: data.summaryCards.subscriptionsTotal.title,
      value: data.summaryCards.subscriptionsTotal.formattedValue,
      supportingText: data.summaryCards.subscriptionsTotal.subtitle,
      icon: CreditCard,
    },
    {
      label: hasMonthlyBudget
        ? data.summaryCards.budgetLeft.isOverBudget
          ? "Over budget"
          : "Budget remaining"
        : "Monthly budget",
      value: hasMonthlyBudget
        ? data.summaryCards.budgetLeft.formattedValue
        : "No budget set",
      supportingText: hasMonthlyBudget
        ? data.summaryCards.budgetLeft.subtitle
        : "Set a monthly spending limit",
      icon: PiggyBank,
      tone: hasMonthlyBudget && data.summaryCards.budgetLeft.isOverBudget
        ? ("danger" as const)
        : ("default" as const),
    },
  ];

  return (
    <div className="-mt-1 w-full min-w-0 space-y-4 pb-5">
      <section className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground md:text-2xl">
            Welcome back, {userName}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Here&apos;s your financial overview.
          </p>
        </div>

        <span className="inline-flex w-fit shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
          {getRangeLabel(selectedRange)}
        </span>
      </section>

      <FinancialSummary items={summaryItems} />

      {data.alert ? (
        <section
          role={data.alert.type === "danger" || data.alert.type === "warning" ? "alert" : "status"}
          className={`flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs leading-5 ${
            data.alert.type === "danger"
              ? "border-red-500/15 bg-red-500/[0.06] text-red-300"
              : data.alert.type === "warning"
                ? "border-amber-500/15 bg-amber-500/[0.06] text-amber-200"
                : "border-blue-500/15 bg-blue-500/[0.05] text-muted-foreground"
          }`}
        >
          <AlertTriangle
            className={`size-3.5 shrink-0 ${
              data.alert.type === "danger"
                ? "text-red-400"
                : data.alert.type === "warning"
                  ? "text-amber-300"
                  : "text-blue-400"
            }`}
            aria-hidden="true"
          />
          <p className="min-w-0">
            {data.alert.type === "info" && topCategory
              ? `${topCategory.label} is your highest category at ${formatCurrency(
                  topCategory.amount
                )} - ${topCategory.percentage}% of this month's spending.`
              : data.alert.message}
          </p>
        </section>
      ) : null}

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel className="min-w-0 p-0">
          <div className="border-b border-border/70 px-4 py-3 sm:px-5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Spending Overview
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {getRangeLabel(selectedRange)} category distribution
            </p>
          </div>

          {data.expenseOverview.categoryBreakdown.length > 0 ? (
            <div className="grid min-w-0 items-center gap-2 p-3 sm:p-4 lg:grid-cols-[minmax(280px,1fr)_minmax(260px,0.8fr)]">
              <div className="flex min-h-56 min-w-0 items-center justify-center">
                <div className="w-full max-w-md">
                  <SpendingDonutChart
                    categories={data.expenseOverview.categoryBreakdown}
                  />
                </div>
              </div>

              <div className="min-w-0 lg:border-l lg:border-border/70 lg:pl-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Categories
                  </p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {formatCurrency(data.expenseOverview.totalSpent)}
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  {data.expenseOverview.categoryBreakdown
                    .slice(0, 6)
                    .map((category, index) => (
                      <div key={category.category} className="py-2 first:pt-0">
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  categoryColors[index % categoryColors.length],
                              }}
                            />
                            <p className="truncate text-sm text-foreground">
                              {category.label}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-medium text-foreground tabular-nums">
                              {formatCurrency(category.amount)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {category.percentage}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-accent">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(category.percentage, 100)}%`,
                              backgroundColor:
                                categoryColors[index % categoryColors.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyBlock
              title="No spending data yet"
              description="Category spending will appear here once expenses are added."
            />
          )}
        </Panel>

        <Panel className="min-w-0">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Budget Overview
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Monthly spending limit
              </p>
            </div>

            {hasMonthlyBudget ? (
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${budgetTone === "danger"
                  ? "bg-red-500/10 text-red-400"
                  : budgetTone === "warning"
                    ? "bg-amber-500/10 text-amber-300"
                    : "bg-green-500/10 text-green-400"
                  }`}
              >
                {data.summaryCards.budgetLeft.isOverBudget
                  ? "Over budget"
                  : budgetTone === "danger"
                    ? "Near limit"
                    : budgetTone === "warning"
                      ? "Watch spending"
                      : "On track"}
              </span>
            ) : null}
          </div>

          {hasMonthlyBudget ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="mt-1 text-lg font-semibold text-foreground tabular-nums">
                    {formatCurrency(monthSpend)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {data.summaryCards.budgetLeft.isOverBudget
                      ? "Over by"
                      : "Remaining"}
                  </p>
                  <p
                    className={`mt-1 text-lg font-semibold tabular-nums ${data.summaryCards.budgetLeft.isOverBudget
                      ? "text-red-400"
                      : "text-foreground"
                      }`}
                  >
                    {data.summaryCards.budgetLeft.isOverBudget
                      ? formatCurrency(budgetDifference)
                      : formatCurrency(budgetRemaining)}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">
                    {budgetUsedPercentage}% used
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(budgetAmount)}
                  </span>
                </div>
                <ProgressBar
                  value={budgetUsedPercentage}
                  color={budgetProgressColor}
                />
              </div>
            </>
          ) : (
            <div className="mt-5 py-3">
              <p className="text-sm font-medium text-foreground">No budget set</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Create a monthly budget to track remaining spend and usage.
              </p>
              <Link
                href="/dashboard/budgets"
                className="mt-3 inline-flex text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Create a budget
              </Link>
            </div>
          )}

          <div className="mt-4 border-t border-border/70 pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-foreground">
                Category budgets
              </h3>
              <Link
                href="/dashboard/budgets"
                className="text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                View all
              </Link>
            </div>

            {data.categoryBudgets.length > 0 ? (
              <div className="space-y-3">
                {data.categoryBudgets.map((budget) => (
                  <div key={budget.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-foreground">{budget.label}</span>
                      <span
                        className={
                          budget.usedPercentage > 90
                            ? "shrink-0 text-red-400 tabular-nums"
                            : budget.usedPercentage >= 70
                              ? "shrink-0 text-amber-300 tabular-nums"
                              : "shrink-0 text-muted-foreground tabular-nums"
                        }
                      >
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)} ({budget.usedPercentage}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={budget.usedPercentage}
                      color={
                        budget.usedPercentage > 90
                          ? "bg-red-500"
                          : budget.usedPercentage >= 70
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground">
                No category budgets configured.
              </p>
            )}
          </div>
        </Panel>
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Panel className="min-w-0 p-0">
          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Expenses</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest activity</p>
            </div>
            <Link
              href="/dashboard/expenses"
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              View all
            </Link>
          </div>

          {data.recentExpenses.length > 0 ? (
            <div className="divide-y divide-border/60 px-4 pb-2 sm:px-5">
              {data.recentExpenses.slice(0, 3).map((expense) => {
                const Icon = getExpenseIcon(expense.category);
                return (
                  <div
                    key={expense.id}
                    className="flex min-w-0 items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-blue-400">
                        <Icon className="size-3.5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {expense.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {expense.label} · {formatTime(expense.spentAt)}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                      {expense.formattedAmount}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyBlock
              title="No recent expenses"
              description="Your latest expenses will appear here."
            />
          )}
        </Panel>

        <Panel className="min-w-0 p-0">
          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Upcoming Renewals</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Renewing soon</p>
            </div>
            <Link
              href="/dashboard/subscriptions"
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              View all
            </Link>
          </div>

          {data.upcomingRenewals.length > 0 ? (
            <div className="divide-y divide-border/60 px-4 pb-2 sm:px-5">
              {data.upcomingRenewals.slice(0, 3).map((renewal) => (
                <div
                  key={renewal.id}
                  className="flex min-w-0 items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                      <CalendarClock className="size-3.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {renewal.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {renewal.planName || renewal.billingCycle} · {renewal.due}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                    {renewal.formattedAmount}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyBlock
              title="No upcoming renewals"
              description="Your active subscriptions will appear here."
            />
          )}
        </Panel>
      </section>

      <section className="flex min-w-0 flex-col gap-2.5 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
            <Flame className="size-3.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-medium text-foreground">No Spend Streak</h2>
            <p className="text-[11px] text-muted-foreground">
              {data.noSpend.streak > 0
                ? `${data.noSpend.streak} ${data.noSpend.streak === 1 ? "day" : "days"} this week`
                : "No spend-free days yet this week."}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 sm:ml-5"
          aria-label="No spend activity this week"
        >
          {data.noSpend.days.map((day, index) => (
            <div key={`${day.label}-${index}`} className="text-center">
              <p className="mb-0.5 text-[9px] text-muted-foreground">{day.label}</p>
              <div
                title={
                  day.isFuture
                    ? "Future day"
                    : day.isNoSpendDay
                      ? "No spend day"
                      : "Spending day"
                }
                className={`size-3.5 rounded-full ${
                  day.isNoSpendDay ? "bg-green-500" : "bg-muted-foreground/35"
                }`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}