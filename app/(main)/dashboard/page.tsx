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

  return (
    <DashboardClient
      data={result.data}
      selectedRange={selectedRange}
    />
  );
}