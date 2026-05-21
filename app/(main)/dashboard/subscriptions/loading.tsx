export default function Loading() {
  return (
    <div className="min-h-screen bg-[#010409] text-white">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-[#151B23]" />
            <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-[#151B23]" />
          </div>

          <div className="h-10 w-40 animate-pulse rounded-lg bg-[#151B23]" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-4"
            >
              <div className="space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-[#151B23]" />
                <div className="h-7 w-24 animate-pulse rounded bg-[#151B23]" />
                <div className="h-3 w-32 animate-pulse rounded bg-[#151B23]" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <section className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="h-11 w-full animate-pulse rounded-lg bg-[#010409] lg:max-w-md" />

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="h-11 w-36 animate-pulse rounded-lg bg-[#010409]" />
              <div className="h-11 w-36 animate-pulse rounded-lg bg-[#010409]" />
            </div>
          </div>
        </section>

        {/* List */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-4"
            >
              <div className="flex animate-pulse flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#151B23]" />

                  <div className="space-y-3">
                    <div className="h-4 w-44 rounded bg-[#151B23]" />
                    <div className="h-3 w-28 rounded bg-[#151B23]" />
                    <div className="flex flex-wrap gap-3">
                      <div className="h-3 w-24 rounded bg-[#151B23]" />
                      <div className="h-3 w-36 rounded bg-[#151B23]" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="h-9 w-24 rounded-lg bg-[#151B23]" />
                  <div className="h-9 w-20 rounded-lg bg-[#151B23]" />
                  <div className="h-9 w-20 rounded-lg bg-[#151B23]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}