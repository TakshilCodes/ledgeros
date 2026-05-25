import { getDashboardData } from "@/actions/dashboard/get-dashboard";
import DashboardClient from "@/components/dashboard/dashboard-client";

type Props = {
  searchParams: Promise<{
    range?: string;
  }>;
};

function getRangeMonthYear(range?: string) {
  const now = new Date();

  if (range === "last-month") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return {
      month: lastMonth.getMonth() + 1,
      year: lastMonth.getFullYear(),
    };
  }

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;

  const selectedRange = params.range || "this-month";
  const { month, year } = getRangeMonthYear(selectedRange);

  const result = await getDashboardData({
    month,
    year,
  });

  if (!result.ok || !result.data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
        {result.error || "Failed to load dashboard"}
      </div>
    );
  }

  return (
    <DashboardClient
      data={result.data}
      selectedRange={selectedRange}
    />
  );
}