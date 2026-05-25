"use client";

import type { ElementType } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Car,
  CreditCard,
  Flame,
  PiggyBank,
  ReceiptText,
  TrendingUp,
  Utensils,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { SpendingBarChart, SpendingDonutChart } from "./dashboard-charts";
import type { DashboardData } from "@/types/dashboard";

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

function getRangeLabel(range: string) {
  if (range === "last-month") return "Last month";
  return "This month";
}

function EmptyBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#3D444D] bg-[#0D1117] p-5 text-center">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#8B949E]">{description}</p>
    </div>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full min-w-0 overflow-hidden rounded-2xl border border-[#3D444D] bg-[#0D1117] ${className}`}
    >
      {children}
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
  icon: ElementType;
  isDanger?: boolean;
}) {
  return (
    <SectionCard className="h-full p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#151B23] text-[#58A6FF]">
            <Icon size={15} />
          </div>

          <p className="mt-5 truncate text-[11px] font-semibold uppercase tracking-wide text-[#C9D1D9]">
            {title}
          </p>

          <h3
            className={`mt-2 truncate text-2xl font-bold leading-none tracking-tight ${isDanger ? "text-red-400" : "text-white"
              }`}
          >
            {value}
          </h3>

          <p className="mt-3 line-clamp-1 text-xs font-normal leading-4 text-[#8B949E]">
            {subtitle}
          </p>
        </div>

        <TrendingUp size={14} className="mt-1 shrink-0 text-[#3FB950]" />
      </div>
    </SectionCard>
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

export default function DashboardClient({ data, selectedRange }: Props) {
  const session = useSession();
  const userName = session.data?.user?.name?.split(" ")[0] || "User";

  if (!data) {
    return (
      <div className="w-full min-w-0">
        <EmptyBlock
          title="Unable to load dashboard"
          description="Something went wrong while loading your dashboard."
        />
      </div>
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
    <div className="w-full min-w-0 overflow-x-hidden pb-4">
      <div className="w-full max-w-none space-y-4 overflow-x-hidden sm:space-y-5 xl:mx-auto xl:max-w-350">
        {/* App-style welcome header */}
        <section className="w-full min-w-0">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">

              <h1 className="mt-2 text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                Welcome back, {userName} 👋
              </h1>

              <p className="mt-2 text-sm font-normal leading-5 text-[#8B949E]">
                Here&apos;s your financial overview.
              </p>
            </div>

            <span className="hidden shrink-0 rounded-full border border-[#3D444D] bg-[#151B23] px-3 py-1.5 text-xs font-medium text-[#C9D1D9] sm:inline-flex">
              {getRangeLabel(selectedRange)}
            </span>
          </div>
        </section>

        {/* Summary cards - no horizontal scroll */}
        <section className="relative w-full min-w-0">
          {/* Right gradient hint on mobile */}
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-linear-to-l from-[#010409] to-transparent sm:hidden" />

          <div className="scrollbar-hide flex w-full gap-3 overflow-x-auto scroll-smooth pb-1 pr-10 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pr-0 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.title} className="w-[82%] shrink-0 sm:w-full sm:shrink">
                <SummaryCard {...card} />
              </div>
            ))}
          </div>
        </section>

        {/* Alert */}
        {dashboardData.alert ? (
          <section
            className={`w-full min-w-0 rounded-2xl border px-4 py-3 text-sm ${dashboardData.alert.type === "danger"
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : dashboardData.alert.type === "warning"
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                : "border-[#58A6FF]/30 bg-[#58A6FF]/10 text-[#58A6FF]"
              }`}
          >
            <div className="flex min-w-0 items-start gap-3">
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              <p className="min-w-0 text-sm font-medium leading-6">
                {dashboardData.alert.message}
              </p>
            </div>
          </section>
        ) : null}

        {/* Main app content */}
        <section className="grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0 space-y-4">
            {/* Charts */}
            <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
              <SectionCard className="p-4">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-white">
                    Category Split
                  </h2>
                  <p className="mt-1 text-xs text-[#8B949E]">
                    Where your money went
                  </p>
                </div>

                <div className="min-w-0 overflow-hidden">
                  {dashboardData.expenseOverview.categoryBreakdown.length > 0 ? (
                    <div className="mx-auto w-full max-w-[320px] sm:max-w-105">
                      <SpendingDonutChart
                        categories={
                          dashboardData.expenseOverview.categoryBreakdown
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center text-xs text-[#8B949E]">
                      No category data yet
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard className="p-4">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-white">
                    Spending Chart
                  </h2>
                  <p className="mt-1 text-xs text-[#8B949E]">
                    Category-wise spending
                  </p>
                </div>

                <div className="min-w-0 overflow-hidden">
                  {dashboardData.expenseOverview.categoryBreakdown.length > 0 ? (
                    <div className="w-full min-w-0">
                      <SpendingBarChart
                        categories={
                          dashboardData.expenseOverview.categoryBreakdown
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center text-xs text-[#8B949E]">
                      No spending data yet
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Recent lists */}
            <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
              <SectionCard className="p-4">
                <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-white">
                      Recent Expenses
                    </h2>
                    <p className="mt-1 text-xs text-[#8B949E]">
                      Latest spending activity
                    </p>
                  </div>

                  <Link
                    href="/dashboard/expenses"
                    className="shrink-0 text-xs font-medium text-[#58A6FF]"
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
                          className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-[#010409] px-3 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#151B23] text-[#58A6FF]">
                              <Icon size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {expense.name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-[#8B949E]">
                                {expense.label}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-white">
                              {expense.formattedAmount}
                            </p>
                            <p className="mt-0.5 text-xs text-[#8B949E]">
                              {formatTime(expense.spentAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyBlock
                      title="No recent expenses"
                      description="Your latest expenses will appear here."
                    />
                  )}
                </div>
              </SectionCard>

              <SectionCard className="p-4">
                <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-white">
                      Upcoming Renewals
                    </h2>
                    <p className="mt-1 text-xs text-[#8B949E]">
                      Subscriptions renewing soon
                    </p>
                  </div>

                  <Link
                    href="/dashboard/subscriptions"
                    className="shrink-0 text-xs font-medium text-[#58A6FF]"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-2">
                  {dashboardData.upcomingRenewals.length > 0 ? (
                    dashboardData.upcomingRenewals.slice(0, 4).map((renewal) => (
                      <div
                        key={renewal.id}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-[#010409] px-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112617] text-[#3FB950]">
                            <CalendarClock size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {renewal.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-[#8B949E]">
                              {renewal.planName || renewal.billingCycle}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-white">
                            {renewal.formattedAmount}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-yellow-400">
                            {renewal.due}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyBlock
                      title="No upcoming renewals"
                      description="Your active subscriptions will appear here."
                    />
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Right side / mobile stacked widgets */}
          <aside className="min-w-0 space-y-4">
            <SectionCard className="p-4">
              <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-white sm:text-base">
                    Budget Overview
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#8B949E]">
                    Monthly spending limit status
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${dashboardData.summaryCards.budgetLeft.isOverBudget
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-[#238636]/30 bg-[#238636]/10 text-[#3FB950]"
                    }`}
                >
                  {dashboardData.summaryCards.budgetLeft.isOverBudget
                    ? "Over"
                    : "On Track"}
                </span>
              </div>

              <div>
                <div className="mb-2 flex min-w-0 items-center justify-between gap-3 text-sm">
                  <span className="text-[#8B949E]">Budget Status</span>
                  <span
                    className={`truncate font-semibold ${dashboardData.summaryCards.budgetLeft.isOverBudget
                      ? "text-red-400"
                      : "text-white"
                      }`}
                  >
                    {dashboardData.summaryCards.budgetLeft.formattedValue}
                  </span>
                </div>

                <ProgressBar
                  value={
                    dashboardData.summaryCards.budgetLeft.isOverBudget ? 100 : 68
                  }
                  color={
                    dashboardData.summaryCards.budgetLeft.isOverBudget
                      ? "bg-red-500"
                      : "bg-[#238636]"
                  }
                />

                <p className="mt-3 text-xs leading-5 text-[#8B949E]">
                  {dashboardData.summaryCards.budgetLeft.subtitle}
                </p>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">
                    Category Budget
                  </h3>

                  <Link
                    href="/dashboard/budgets"
                    className="shrink-0 text-xs font-medium text-[#58A6FF]"
                  >
                    View
                  </Link>
                </div>

                <div className="space-y-4">
                  {dashboardData.categoryBudgets.length > 0 ? (
                    dashboardData.categoryBudgets.map((budget) => (
                      <div key={budget.id} className="min-w-0">
                        <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                          <p className="truncate text-xs font-semibold text-white">
                            {budget.label}
                          </p>
                          <p className="shrink-0 text-xs text-[#8B949E]">
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
                    <EmptyBlock
                      title="No category budgets"
                      description="Create category budgets to track spending limits."
                    />
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard className="p-4">
              <div className="flex min-w-0 items-center gap-2">
                <Flame size={18} className="shrink-0 text-orange-400" />
                <h2 className="text-sm font-semibold text-white sm:text-base">
                  No Spend Streak
                </h2>
              </div>

              <p className="mt-4 text-3xl font-bold tracking-tight text-orange-400">
                {dashboardData.noSpend.streak}{" "}
                <span className="text-xl">
                  {dashboardData.noSpend.streak === 1 ? "Day" : "Days"}
                </span>
              </p>

              <p className="mt-1 text-sm leading-6 text-[#8B949E]">
                {dashboardData.noSpend.streak > 0
                  ? "Keep it up! You're on fire 🔥"
                  : "Spend-free days will appear here."}
              </p>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {dashboardData.noSpend.days.map((day, index) => (
                  <div key={`${day.label}-${index}`} className="text-center">
                    <p className="mb-2 truncate text-[10px] text-[#8B949E]">
                      {day.label}
                    </p>

                    <div
                      title={
                        day.isFuture
                          ? "Future day"
                          : day.isNoSpendDay
                            ? "No spend day"
                            : "Spending day"
                      }
                      className={`mx-auto h-7 w-7 rounded-full border ${day.isNoSpendDay
                        ? "border-[#238636] bg-[#238636]"
                        : day.hasExpense
                          ? "border-red-500/40 bg-red-500/20"
                          : "border-[#3D444D] bg-[#151B23]"
                        }`}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard className="p-4">
              <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-white sm:text-base">
                    Weekly Report
                  </h2>
                  <p className="mt-1 text-xs text-[#8B949E]">
                    Quick spending summary
                  </p>
                </div>

                <Link
                  href="/dashboard/insights"
                  className="shrink-0 text-xs text-[#58A6FF]"
                >
                  Full Report
                </Link>
              </div>

              <p className="text-xs text-[#8B949E]">This Week</p>
              <p className="mt-1 truncate text-2xl font-bold text-white">
                {dashboardData.summaryCards.thisMonthSpend.formattedValue}
              </p>
              <p className="mt-1 text-xs text-[#8B949E]">Total Spend</p>

              <div className="mt-4 rounded-2xl bg-[#010409] p-3">
                <div className="flex min-w-0 items-start gap-2">
                  <BarChart3 size={16} className="mt-0.5 shrink-0 text-yellow-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      Spending summary ready
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#8B949E]">
                      Check Insights for deeper category and budget analysis.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </aside>
        </section>
      </div>
    </div>
  );
}