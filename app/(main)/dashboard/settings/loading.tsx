function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#151B23] ${className}`}
    />
  );
}

function CardSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
      {children}
    </section>
  );
}

function AccountOverviewSkeleton() {
  return (
    <CardSkeleton>
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-16 w-16 rounded-2xl" />

        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-52 max-w-full" />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#3D444D] bg-[#010409]/70 p-3">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="mt-2 h-4 w-32" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#3D444D] bg-[#151B23] p-3"
          >
            <SkeletonBlock className="h-5 w-10 bg-[#0D1117]" />
            <SkeletonBlock className="mt-2 h-3 w-20 bg-[#0D1117]" />
          </div>
        ))}
      </div>
    </CardSkeleton>
  );
}

function DataExportSkeleton() {
  return (
    <CardSkeleton>
      <div className="mb-5 flex items-start gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-xl" />

        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-3 w-48" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#3D444D] bg-[#151B23] p-4"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-28 bg-[#0D1117]" />
              <SkeletonBlock className="h-3 w-56 max-w-full bg-[#0D1117]" />
            </div>

            <SkeletonBlock className="h-9 w-9 rounded-lg bg-[#0D1117]" />
          </div>
        ))}
      </div>

      <SkeletonBlock className="mt-4 h-12 w-full" />
    </CardSkeleton>
  );
}

function AccountSettingsSkeleton() {
  return (
    <CardSkeleton>
      <div className="mb-4 flex items-center gap-3">
        <SkeletonBlock className="h-9 w-9 rounded-xl" />

        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-48" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#3D444D] bg-[#151B23] p-3 sm:p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <SkeletonBlock className="h-8 w-8 rounded-lg bg-[#0D1117]" />

              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-28 bg-[#0D1117]" />
                <SkeletonBlock className="h-3 w-44 bg-[#0D1117]" />
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-16 bg-[#0D1117]" />
                <SkeletonBlock className="h-9 w-full bg-[#0D1117]" />
              </div>

              <SkeletonBlock className="h-9 w-full bg-[#0D1117] lg:w-20" />
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-[#3D444D] bg-[#151B23] p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-3">
            <SkeletonBlock className="h-8 w-8 rounded-lg bg-[#0D1117]" />

            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-24 bg-[#0D1117]" />
              <SkeletonBlock className="h-3 w-40 bg-[#0D1117]" />
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonBlock className="h-3 w-24 bg-[#0D1117]" />
                <SkeletonBlock className="h-9 w-full bg-[#0D1117]" />
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SkeletonBlock className="h-4 w-28 bg-[#0D1117]" />
            <SkeletonBlock className="h-9 w-full bg-[#0D1117] sm:w-40" />
          </div>
        </div>
      </div>
    </CardSkeleton>
  );
}

function DangerZoneSkeleton() {
  return (
    <section className="rounded-2xl border border-red-500/30 bg-[#0D1117] p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-xl" />

        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-3 w-52" />
        </div>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3 w-72 max-w-full" />
            <SkeletonBlock className="h-3 w-56 max-w-full" />
          </div>

          <SkeletonBlock className="h-9 w-full lg:w-36" />
        </div>
      </div>
    </section>
  );
}

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 border-b border-[#3D444D] pb-5 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-32" />
          <SkeletonBlock className="h-4 w-72 max-w-full" />
        </div>

        <SkeletonBlock className="h-7 w-32 rounded-full" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <AccountOverviewSkeleton />
          <DataExportSkeleton />
        </aside>

        <main className="space-y-6">
          <AccountSettingsSkeleton />
          <DangerZoneSkeleton />
        </main>
      </div>
    </div>
  );
}