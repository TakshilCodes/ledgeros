function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#151B23] ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="min-w-57.5 snap-start rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-3 h-7 w-32" />
          <SkeletonBlock className="mt-2 h-3 w-24" />
        </div>

        <SkeletonBlock className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto] lg:items-end">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-10 w-full" />
        </div>

        <SkeletonBlock className="h-10 w-full lg:w-28" />
      </div>
    </div>
  );
}

function SubscriptionListSkeleton() {
  return (
    <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="mt-2 h-3 w-52" />
        </div>

        <SkeletonBlock className="h-9 w-28" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#3D444D] bg-[#010409] p-4"
          >
            <div className="hidden items-center justify-between gap-4 md:flex">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <SkeletonBlock className="h-12 w-12 rounded-2xl" />

                <div className="min-w-0 flex-1 space-y-3">
                  <SkeletonBlock className="h-4 w-40" />
                  <SkeletonBlock className="h-3 w-64 max-w-full" />
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-6 w-20 rounded-full" />
                    <SkeletonBlock className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="space-y-2 text-right">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>

                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
              </div>
            </div>

            <div className="md:hidden">
              <div className="flex items-start gap-3">
                <SkeletonBlock className="h-11 w-11 rounded-xl" />

                <div className="min-w-0 flex-1 space-y-3">
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="h-3 w-44" />
                  <div className="flex flex-wrap gap-2">
                    <SkeletonBlock className="h-5 w-20 rounded-full" />
                    <SkeletonBlock className="h-5 w-24 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-4 w-28" />
                </div>

                <SkeletonBlock className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SubscriptionsLoading() {
  return (
    <div className="min-h-screen bg-[#010409] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <SkeletonBlock className="h-7 w-40" />
            <SkeletonBlock className="mt-2 h-4 w-72 max-w-full" />
          </div>

          <SkeletonBlock className="h-10 w-full sm:w-40" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between md:hidden">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-3 w-28" />
          </div>

          <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>
        </div>

        <FiltersSkeleton />

        <SubscriptionListSkeleton />
      </div>
    </div>
  );
}