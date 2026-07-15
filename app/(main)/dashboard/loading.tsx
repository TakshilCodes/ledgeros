function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-accent ${className}`} />;
}

export default function Loading() {
  return (
    <main className="w-full min-w-0 space-y-4 text-foreground">
      <section>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </section>

      <section className="grid overflow-hidden rounded-xl border border-border/70 bg-card px-3.5 py-0.5 sm:grid-cols-2 sm:px-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`flex items-center gap-2.5 py-2.5 sm:px-4 sm:first:pl-0 ${
              index > 0 ? "border-t border-border/70 sm:border-t-0" : ""
            } ${index >= 2 ? "sm:border-t sm:border-border/70 xl:border-t-0" : ""}`}
          >
            <Skeleton className="size-7 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-5 w-28" />
              <Skeleton className="mt-1.5 h-3 w-32 max-w-full" />
            </div>
          </div>
        ))}
      </section>

      <Skeleton className="h-11 w-full rounded-lg" />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="border-b border-border/70 px-5 py-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-52" />
          </div>
          <div className="grid items-center gap-3 p-4 lg:grid-cols-[minmax(280px,1fr)_minmax(260px,0.8fr)]">
            <div className="flex min-h-56 items-center justify-center">
              <Skeleton className="size-40 rounded-full" />
            </div>
            <div className="space-y-3 lg:border-l lg:border-border/70 lg:pl-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="mt-2 h-1 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-12" />
              <Skeleton className="mt-2 h-6 w-24" />
            </div>
            <div>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-6 w-24" />
            </div>
          </div>
          <Skeleton className="mt-5 h-1.5 w-full rounded-full" />
          <div className="mt-5 border-t border-border/70 pt-4">
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="mt-4">
                <div className="flex justify-between gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <div
            key={sectionIndex}
            className="overflow-hidden rounded-xl border border-border/70 bg-card"
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="divide-y divide-border/60 px-5 pb-2">
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-7 shrink-0 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="mt-1.5 h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="flex items-center justify-between border-t border-border/70 pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-1.5 h-3 w-40" />
          </div>
        </div>
        <div className="hidden gap-2 sm:flex">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="size-4 rounded-full" />
          ))}
        </div>
      </section>
    </main>
  );
}