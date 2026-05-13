import Link from "next/link";
import { Plus } from "lucide-react";
import ExpensesList from "@/components/Expense/ExpenseList";
import ExpenseFilters from "@/components/Expense/ExpenseFilters";
import { getExpenseStats, getExpenses } from "@/actions/expense/getExpenses";
import { useExpenseModal } from "@/store/expense-modal-store";

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    date?: string;
    sort?: string;
  }>;
};

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

  const stats = [
    { label: "This Month", value: `₹${statsData.thisMonth}` },
    { label: "Today", value: `₹${statsData.today}` },
    { label: "Top Category", value: statsData.topCategory },
    { label: "Expenses", value: String(statsData.totalExpenses) },
  ];

  return (
    <div className="space-y-4">

      <section className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 sm:grid sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-36 rounded-xl border border-[#3D444D] bg-[#0D1117] p-3 transition hover:border-[#4B5563] hover:bg-[#11161d] sm:min-w-0"
            >
              <p className="text-xs text-[#8B949E]">{stat.label}</p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {stat.value}
              </h2>
            </div>
          ))}
        </div>
      </section>

      <ExpenseFilters />

      <section className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">All Expenses</h2>
        </div>
        <ExpensesList
          initialExpenses={expensesData.expenses}
          initialCursor={expensesData.nextCursor}
          filters={filters}
        />
      </section>
    </div>
  );
}