import { LoadingSkeleton } from "@/components/ui/foundation";

function SummarySkeleton() {
  return (
    <div className="grid overflow-hidden rounded-xl border border-border/70 bg-card sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="relative flex min-h-24 items-center gap-3 px-4 py-3 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-border/70 sm:after:hidden xl:after:inset-y-[20%] xl:after:right-0 xl:after:left-auto xl:after:h-auto xl:after:w-px last:after:hidden"
        >
          <LoadingSkeleton className="size-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <LoadingSkeleton className="h-3 w-24" />
            <LoadingSkeleton className="h-6 w-28" />
            <LoadingSkeleton className="h-3 w-32 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <main className="w-full min-w-0 space-y-4 text-foreground">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <LoadingSkeleton className="h-7 w-28" />
          <LoadingSkeleton className="h-4 w-80 max-w-full" />
        </div>
        <LoadingSkeleton className="h-10 w-full rounded-lg sm:w-72" />
      </header>

      <SummarySkeleton />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <LoadingSkeleton className="size-8 rounded-lg" />
              <div className="space-y-2">
                <LoadingSkeleton className="h-4 w-40" />
                <LoadingSkeleton className="h-3 w-56 max-w-full" />
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <div className="space-y-1.5">
                      <LoadingSkeleton className="h-4 w-28" />
                      <LoadingSkeleton className="h-3 w-20" />
                    </div>
                    <LoadingSkeleton className="h-4 w-20" />
                  </div>
                  <LoadingSkeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/70 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <LoadingSkeleton className="size-8 rounded-lg" />
              <div className="space-y-2">
                <LoadingSkeleton className="h-4 w-28" />
                <LoadingSkeleton className="h-3 w-52 max-w-full" />
              </div>
            </div>
            <LoadingSkeleton className="mt-4 h-2 w-full rounded-full" />
            <div className="mt-3 grid grid-cols-3 divide-x divide-border/70">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2 px-3 first:pl-0 last:pr-0">
                  <LoadingSkeleton className="h-3 w-14" />
                  <LoadingSkeleton className="h-5 w-20 max-w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/70">
            <div className="px-4 py-3 sm:px-5">
              <LoadingSkeleton className="h-4 w-32" />
              <LoadingSkeleton className="mt-2 h-3 w-44" />
            </div>
            <div className="divide-y divide-border/60 border-t border-border/60 px-4 sm:px-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex justify-between gap-3 py-3">
                  <div className="space-y-2">
                    <LoadingSkeleton className="h-4 w-36" />
                    <LoadingSkeleton className="h-3 w-28" />
                  </div>
                  <LoadingSkeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="self-start overflow-hidden rounded-xl border border-border/70 bg-card">
          {Array.from({ length: 3 }).map((_, section) => (
            <div key={section} className="border-b border-border/70 px-4 py-4 last:border-b-0">
              <LoadingSkeleton className="h-4 w-32" />
              <LoadingSkeleton className="mt-2 h-3 w-48" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: section === 0 ? 4 : 3 }).map((__, item) => (
                  <div key={item} className="flex justify-between gap-3">
                    <div className="space-y-2">
                      <LoadingSkeleton className="h-3 w-32" />
                      <LoadingSkeleton className="h-3 w-40" />
                    </div>
                    <LoadingSkeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
