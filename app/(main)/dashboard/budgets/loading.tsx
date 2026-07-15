import { LoadingSkeleton } from "@/components/ui/foundation";

function BudgetRowSkeleton() {
  return (
    <div className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(12rem,1fr)_minmax(14rem,1.15fr)_minmax(12rem,.8fr)_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <LoadingSkeleton className="size-9 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <LoadingSkeleton className="h-4 w-36 max-w-full" />
          <LoadingSkeleton className="h-3 w-28 max-w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <LoadingSkeleton className="h-3 w-28" />
          <LoadingSkeleton className="h-3 w-8" />
        </div>
        <LoadingSkeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="flex justify-between gap-3 lg:block lg:space-y-2 lg:text-right">
        <LoadingSkeleton className="h-4 w-20 lg:ml-auto" />
        <LoadingSkeleton className="h-3 w-24 lg:ml-auto" />
      </div>
      <LoadingSkeleton className="size-9 justify-self-end rounded-lg" />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="w-full min-w-0 space-y-4 text-foreground">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <LoadingSkeleton className="h-7 w-32" />
          <LoadingSkeleton className="h-4 w-72 max-w-full" />
        </div>
        <LoadingSkeleton className="h-10 w-32 rounded-lg" />
      </header>

      <section className="grid overflow-hidden rounded-xl border border-border/70 bg-card sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="relative flex min-h-24 items-center gap-3 px-4 py-3 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-border/70 sm:after:hidden xl:after:inset-y-[20%] xl:after:right-0 xl:after:left-auto xl:after:h-auto xl:after:w-px last:after:hidden">
            <LoadingSkeleton className="size-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <LoadingSkeleton className="h-3 w-24" />
              <LoadingSkeleton className="h-6 w-28" />
              <LoadingSkeleton className="h-3 w-32 max-w-full" />
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-3 sm:flex-row">
        <LoadingSkeleton className="h-10 w-full rounded-lg sm:w-72" />
        <LoadingSkeleton className="h-10 w-full rounded-lg sm:ml-auto sm:w-40" />
      </div>

      <section className="rounded-xl border border-border/70 bg-card px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3">
            <LoadingSkeleton className="size-9 rounded-lg" />
            <div className="space-y-2">
              <LoadingSkeleton className="h-4 w-44" />
              <LoadingSkeleton className="h-3 w-52 max-w-full" />
            </div>
          </div>
          <LoadingSkeleton className="h-2 flex-[1.35] rounded-full" />
          <LoadingSkeleton className="h-8 w-28" />
        </div>
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="space-y-2 border-b border-border/70 px-4 py-3 sm:px-5">
            <LoadingSkeleton className="h-4 w-28" />
            <LoadingSkeleton className="h-3 w-16" />
          </div>
          <div className="divide-y divide-border/60">
            {Array.from({ length: 5 }).map((_, index) => (
              <BudgetRowSkeleton key={index} />
            ))}
          </div>
        </section>

        <aside className="self-start overflow-hidden rounded-xl border border-border/70 bg-card">
          {Array.from({ length: 3 }).map((_, section) => (
            <div key={section} className="border-b border-border/70 px-4 py-4 last:border-b-0">
              <LoadingSkeleton className="h-4 w-32" />
              <LoadingSkeleton className="mt-2 h-3 w-44" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((__, item) => (
                  <LoadingSkeleton key={item} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
