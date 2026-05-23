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

  return (
    <InsightsClient
      data={result.data}
      selectedMonth={month}
      selectedYear={year}
    />
  );
}