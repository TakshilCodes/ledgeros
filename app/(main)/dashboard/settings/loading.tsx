import { LoadingSkeleton } from "@/components/ui/foundation";

function SettingsSectionSkeleton({
  rows,
}: {
  rows: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="flex items-center gap-3 border-b border-border/70 px-4 py-4">
        <LoadingSkeleton className="size-9 rounded-lg" />
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <LoadingSkeleton className="size-8 rounded-lg" />
              <div className="space-y-2">
                <LoadingSkeleton className="h-4 w-28" />
                <LoadingSkeleton className="h-3 w-44" />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="flex-1 space-y-2">
                <LoadingSkeleton className="h-3 w-16" />
                <LoadingSkeleton className="h-10 w-full" />
              </div>
              <LoadingSkeleton className="h-9 w-full rounded-lg lg:w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="w-full min-w-0 space-y-4">
      <header className="space-y-2">
        <LoadingSkeleton className="h-7 w-32" />
        <LoadingSkeleton className="h-4 w-80 max-w-full" />
      </header>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="self-start overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <LoadingSkeleton className="size-11 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <LoadingSkeleton className="h-4 w-32" />
                <LoadingSkeleton className="h-3 w-48 max-w-full" />
              </div>
            </div>
            <div className="mt-3 flex justify-between border-t border-border/60 pt-3">
              <LoadingSkeleton className="h-3 w-20" />
              <LoadingSkeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-border/70">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-r border-b border-border/60 px-4 py-3 even:border-r-0">
                <LoadingSkeleton className="h-5 w-8" />
                <LoadingSkeleton className="mt-2 h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="border-t border-border/70 px-4 py-4">
            <LoadingSkeleton className="h-4 w-28" />
            <LoadingSkeleton className="mt-2 h-3 w-44" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex justify-between gap-3">
                  <div className="space-y-2">
                    <LoadingSkeleton className="h-3 w-24" />
                    <LoadingSkeleton className="h-3 w-40" />
                  </div>
                  <LoadingSkeleton className="size-4" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <SettingsSectionSkeleton rows={3} />
          <div className="overflow-hidden rounded-xl border border-red-500/20 bg-card">
            <div className="flex items-center gap-3 px-4 py-4">
              <LoadingSkeleton className="size-8 rounded-lg" />
              <div className="space-y-2">
                <LoadingSkeleton className="h-4 w-24" />
                <LoadingSkeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-red-500/15 px-4 py-4 lg:flex-row lg:justify-between">
              <div className="space-y-2">
                <LoadingSkeleton className="h-4 w-40" />
                <LoadingSkeleton className="h-3 w-72 max-w-full" />
              </div>
              <LoadingSkeleton className="h-9 w-full rounded-lg lg:w-36" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
