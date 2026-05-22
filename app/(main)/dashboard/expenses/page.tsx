import {
  CalendarDays,
  IndianRupee,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";

import ExpensesList from "@/components/Expense/ExpenseList";
import ExpenseFilters from "@/components/Expense/ExpenseFilters";
import AddExpenseButton from "@/components/Expense/AddExpenseButton";
import { getExpenseStats, getExpenses } from "@/actions/expense/getExpenses";

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    date?: string;
    sort?: string;
  }>;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className="min-w-57.5 snap-start rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#8B949E]">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
          <p className="mt-1 text-xs text-[#6E7681]">{subtitle}</p>
        </div>

        <div className="rounded-xl border border-[#3D444D] bg-[#151B23] p-2 text-[#58A6FF]">
          <Icon size={18} />
        </div>
      </div>
    </div>
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

  const [statsData, expensesData] = await Promise.all([
    getExpenseStats(),
    getExpenses(filters),
  ]);

  return (
    <div className="min-h-screen bg-[#010409] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <AddExpenseButton />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between md:hidden">
            <p className="text-xs text-[#8B949E]">Overview</p>

            <div className="flex items-center gap-2 text-xs text-[#6E7681]">
              <span>Swipe to see more</span>
            </div>
          </div>

          <div className="relative">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
              <StatCard
                title="This Month"
                value={formatCurrency(Number(statsData.thisMonth || 0))}
                subtitle="Total spent this month"
                icon={Wallet}
              />

              <StatCard
                title="Today"
                value={formatCurrency(Number(statsData.today || 0))}
                subtitle="Total spent today"
                icon={CalendarDays}
              />

              <StatCard
                title="Top Category"
                value={statsData.topCategory || "None"}
                subtitle="Highest spending category"
                icon={TrendingUp}
              />

              <StatCard
                title="Expenses"
                value={String(statsData.totalExpenses || 0)}
                subtitle="Total expense records"
                icon={ReceiptText}
              />
            </div>

            <div className="pointer-events-none absolute bottom-3 right-0 top-0 w-12 bg-linear-to-l from-[#010409] to-transparent md:hidden" />
          </div>
        </div>

        <ExpenseFilters />

        <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
          <ExpensesList
            initialExpenses={expensesData.expenses}
            initialCursor={expensesData.nextCursor}
            filters={filters}
          />
        </section>
      </div>
    </div>
  );
}