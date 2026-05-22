import { RefreshCcw } from "lucide-react";

function StatCardSkeleton() {
  return (
    <div className="min-w-57.5 rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full space-y-3">
          <div className="h-3 w-28 animate-pulse rounded bg-[#151B23]" />
          <div className="h-7 w-32 animate-pulse rounded bg-[#151B23]" />
          <div className="h-3 w-36 animate-pulse rounded bg-[#151B23]" />
        </div>

        <div className="h-9 w-9 animate-pulse rounded-xl bg-[#151B23]" />
      </div>
    </div>
  );
}

function RecurringCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-40 animate-pulse rounded bg-[#151B23]" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-[#151B23]" />
          </div>

          <div className="flex gap-3">
            <div className="h-3 w-20 animate-pulse rounded bg-[#151B23]" />
            <div className="h-3 w-24 animate-pulse rounded bg-[#151B23]" />
            <div className="h-3 w-20 animate-pulse rounded bg-[#151B23]" />
          </div>

          <div className="flex gap-2">
            <div className="h-7 w-40 animate-pulse rounded-full bg-[#151B23]" />
            <div className="h-7 w-28 animate-pulse rounded-full bg-[#151B23]" />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="h-10 w-28 animate-pulse rounded-xl bg-[#151B23]" />
          <div className="h-10 w-10 animate-pulse rounded-xl bg-[#151B23]" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#010409] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="h-8 w-64 animate-pulse rounded bg-[#0D1117]" />
            <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-[#0D1117]" />
          </div>

          <div className="h-11 w-40 animate-pulse rounded-xl bg-[#238636]/40" />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
            <div className="h-11 animate-pulse rounded-xl bg-[#010409]" />
            <div className="h-11 animate-pulse rounded-xl bg-[#010409]" />
            <div className="h-11 animate-pulse rounded-xl bg-[#010409]" />
            <div className="h-11 animate-pulse rounded-xl bg-[#010409]" />
            <div className="h-11 animate-pulse rounded-xl bg-[#010409]" />
            <div className="h-11 w-24 animate-pulse rounded-xl bg-[#151B23]" />
          </div>
        </div>

        <div className="space-y-3">
          <RecurringCardSkeleton />
          <RecurringCardSkeleton />
          <RecurringCardSkeleton />
          <RecurringCardSkeleton />
          <RecurringCardSkeleton />
        </div>

        <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#8B949E]">
          <RefreshCcw size={16} className="animate-spin" />
          Loading recurring expenses...
        </div>
      </div>
    </div>
  );
}