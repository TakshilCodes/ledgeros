import { LoadingSkeleton } from "@/components/ui/foundation";

export default function SubscriptionsLoading() {
  return (
    <main className="w-full min-w-0 space-y-4 text-foreground">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <LoadingSkeleton className="h-5 w-44" />
          <LoadingSkeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <LoadingSkeleton className="h-9 w-36 rounded-lg" />
      </section>

      <section className="grid rounded-xl border border-border/70 bg-card px-3.5 py-0.5 sm:grid-cols-2 sm:px-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`flex items-center gap-2.5 py-2.5 sm:px-4 sm:first:pl-0 ${
              index > 0 ? "border-t border-border sm:border-t-0" : ""
            } ${index >= 2 ? "sm:border-t sm:border-border xl:border-t-0" : ""}`}
          >
            <LoadingSkeleton className="size-7 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <LoadingSkeleton className="h-3 w-24" />
              <LoadingSkeleton className="mt-1.5 h-5 w-24" />
              <LoadingSkeleton className="mt-1.5 h-3 w-28 max-w-full" />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-card p-3 ring-1 ring-border/70">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1.5fr)_minmax(150px,1fr)_minmax(150px,1fr)]">
          <LoadingSkeleton className="h-10 w-full sm:col-span-2 xl:col-span-1" />
          <LoadingSkeleton className="h-10 w-full rounded-lg" />
          <LoadingSkeleton className="h-10 w-full rounded-lg" />
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-card">
        <div className="border-b border-border/60 px-4 py-3 sm:px-5">
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="mt-1.5 h-3 w-48" />
        </div>

        <div className="divide-y divide-border/60 px-4 sm:px-5">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[minmax(0,1fr)_minmax(160px,auto)_auto]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <LoadingSkeleton className="size-9 shrink-0 rounded-lg" />
                <div>
                  <LoadingSkeleton className="h-4 w-36" />
                  <LoadingSkeleton className="mt-1.5 h-3 w-24" />
                </div>
              </div>
              <div className="ml-12 sm:ml-0">
                <LoadingSkeleton className="h-3 w-28" />
                <LoadingSkeleton className="mt-1.5 h-3 w-20" />
              </div>
              <div className="flex items-center justify-between gap-2 sm:col-start-2 sm:row-start-1 lg:col-start-3">
                <LoadingSkeleton className="h-4 w-20" />
                <LoadingSkeleton className="size-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
