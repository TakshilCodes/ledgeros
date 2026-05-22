import RecurringClient from "@/components/recurring/recurring-client";
import {
  getRecurring,
  getRecurringStats,
} from "@/actions/recurring/get-recurring";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
    cycle?: string;
    type?: string;
  }>;
};

export default async function RecurringPage({ searchParams }: Props) {
  const params = await searchParams;

  const search = params.search || "";
  const status = params.status || "";
  const category = params.category || "";
  const cycle = params.cycle || "";
  const type = params.type || "";

  const [statsRes, recurringRes] = await Promise.all([
    getRecurringStats(),
    getRecurring({
      search,
      status,
      category,
      cycle,
      type,
    }),
  ]);

  return (
    <RecurringClient
      initialStats={statsRes.stats}
      initialRecurringExpenses={recurringRes.recurringExpenses}
      initialNextCursor={recurringRes.nextCursor}
      filters={{
        search,
        status,
        category,
        cycle,
        type,
      }}
    />
  );
}