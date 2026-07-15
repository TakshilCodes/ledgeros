import { getInsights } from "@/actions/insights/get-insights";
import InsightsClient from "@/components/insights/insights-client";
import { EmptyState } from "@/components/ui/foundation";
import { AlertTriangle } from "lucide-react";

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
  const result = await getInsights({ month, year });

  if (!result.ok || !result.data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Unable to load insights"
        description={result.error || "Failed to load insights."}
        className="border-red-500/20 bg-red-500/5 py-10"
      />
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
