import { getBudgets } from "@/actions/budgets/get-budgets";
import BudgetClient from "@/components/budget/budget-client";

type Props = {
  searchParams: Promise<{
    month?: string;
    year?: string;
    type?: "ALL" | "MONTHLY" | "CATEGORY" | "DAILY_LIMIT";
  }>;
};

export default async function BudgetsPage({ searchParams }: Props) {
  const params = await searchParams;

  const currentDate = new Date();

  const month = Number(params.month || currentDate.getMonth() + 1);
  const year = Number(params.year || currentDate.getFullYear());
  const type = params.type || "ALL";

  const result = await getBudgets({
    month,
    year,
    type,
  });

  return (
    <BudgetClient
      budgets={result.budgets}
      stats={result.stats}
      selectedMonth={month}
      selectedYear={year}
      selectedType={type}
    />
  );
}