import { getInsights } from "@/actions/insights/get-insights";
import InsightsClient from "@/components/insights/insights-client";

type Props = {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function InsightsPage({ searchParams }: Props) {
  const params = await searchParams;

  const currentDate = new Date();

  const month = Number(params.month || currentDate.getMonth() + 1);
  const year = Number(params.year || currentDate.getFullYear());

  const result = await getInsights({
  month,
  year,
});

if (!result.ok || !result.data) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
      {result.error || "Failed to load insights"}
    </div>
  );
}

return (
  <InsightsClient
    data={result.data}
    selectedMonth={month}
    selectedYear={year}
  />
);
}