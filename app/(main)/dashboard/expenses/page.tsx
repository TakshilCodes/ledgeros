import { Suspense } from "react";
import {
  CalendarDays,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";

import ExpensesList from "@/components/Expense/ExpenseList";
import ExpenseFilters from "@/components/Expense/ExpenseFilters";
import AddExpenseButton from "@/components/Expense/AddExpenseButton";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { LoadingSkeleton } from "@/components/ui/foundation";
import { getExpenseStats, getExpenses } from "@/actions/expense/getExpenses";

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    date?: string;
    sort?: string;
  }>;
};

type Filters = {
  search: string;
  category: string;
  date: string;
  sort: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ExpensesListSkeleton() {
  return (
    <section className="rounded-xl border border-border/70 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5">
        <LoadingSkeleton className="h-4 w-28" />
        <LoadingSkeleton className="h-3 w-20" />
      </div>
      <div className="divide-y divide-border/60 px-4 sm:px-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <LoadingSkeleton className="size-8 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <LoadingSkeleton className="h-4 w-36 sm:w-44" />
                <LoadingSkeleton className="mt-2 h-3 w-48 max-w-full sm:w-64" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <LoadingSkeleton className="h-4 w-16 sm:w-20" />
              <LoadingSkeleton className="size-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

async function ExpensesListSection({ filters }: { filters: Filters }) {
  const expensesData = await getExpenses(filters);

  return (
    <section
      aria-labelledby="expense-history-title"
      className="rounded-xl border border-border/70 bg-card"
    >
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5">
        <div>
          <h2 id="expense-history-title" className="text-sm font-semibold text-foreground">
            Expense history
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Your latest recorded spending</p>
        </div>
      </div>
      <ExpensesList
        initialExpenses={expensesData.expenses}
        initialCursor={expensesData.nextCursor}
        filters={filters}
      />
    </section>
  );
}

export default async function ExpensesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = {
    search: params.search || "",
    category: params.category || "ALL",
    date: params.date || "all",
    sort: params.sort || "newest",
  };

  const statsData = await getExpenseStats();
  const filtersKey = JSON.stringify(filters);

  const summaryItems = [
    {
      label: "This month",
      value: formatCurrency(Number(statsData.thisMonth || 0)),
      supportingText: "Total spent this month",
      icon: Wallet,
    },
    {
      label: "Today",
      value: formatCurrency(Number(statsData.today || 0)),
      supportingText: "Total spent today",
      icon: CalendarDays,
    },
    {
      label: "Top category",
      value: statsData.topCategory || "None",
      supportingText: "Highest spending category",
      icon: TrendingUp,
    },
    {
      label: "Total expenses",
      value: String(statsData.totalExpenses || 0),
      supportingText: "Recorded expense entries",
      icon: ReceiptText,
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-4 text-foreground">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Spending summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage your recorded spending.
          </p>
        </div>
        <AddExpenseButton />
      </section>

      <FinancialSummary items={summaryItems} />

      <ExpenseFilters />

      <Suspense key={filtersKey} fallback={<ExpensesListSkeleton />}>
        <ExpensesListSection filters={filters} />
      </Suspense>
    </div>
  );
}
