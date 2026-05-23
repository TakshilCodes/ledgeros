export default function Loading() {
  return (
    <main className="min-h-screen bg-[#010409] px-4 py-6 text-[#C9D1D9] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="h-11 w-32 animate-pulse rounded-xl bg-[#21262D]" />
        </section>

        <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="h-6 w-32 animate-pulse rounded bg-[#21262D]" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#21262D]" />
            </div>

            <div className="flex w-full items-center gap-3 lg:w-auto">
              <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#21262D]" />

              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:w-65 lg:flex-none">
                <div className="h-10 animate-pulse rounded-xl bg-[#21262D]" />
                <div className="h-10 animate-pulse rounded-xl bg-[#21262D]" />
              </div>

              <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#21262D]" />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between md:hidden">
            <div className="h-3 w-16 animate-pulse rounded bg-[#21262D]" />
            <div className="h-3 w-28 animate-pulse rounded bg-[#21262D]" />
          </div>

          <div className="relative">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="min-w-57.5 snap-start rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 md:min-w-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="h-4 w-24 animate-pulse rounded bg-[#21262D]" />
                      <div className="mt-3 h-7 w-28 animate-pulse rounded bg-[#21262D]" />
                      <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[#21262D]" />
                    </div>

                    <div className="h-10 w-10 animate-pulse rounded-xl bg-[#21262D]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-3 right-0 top-0 w-12 bg-linear-to-l from-[#010409] to-transparent md:hidden" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-[#21262D]" />

            <div className="flex-1">
              <div className="h-5 w-52 animate-pulse rounded bg-[#21262D]" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#21262D]" />
            </div>
          </div>

          <div className="mt-4 h-14 animate-pulse rounded-xl bg-[#151B23]" />

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-3 w-36 animate-pulse rounded bg-[#21262D]" />
              <div className="h-3 w-10 animate-pulse rounded bg-[#21262D]" />
            </div>
            <div className="h-2 animate-pulse rounded-full bg-[#21262D]" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl bg-[#151B23] px-3 py-3 sm:px-4 sm:py-4"
              >
                <div className="h-3 w-12 animate-pulse rounded bg-[#21262D]" />
                <div className="mt-2 h-5 w-16 animate-pulse rounded bg-[#21262D]" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="h-6 w-28 animate-pulse rounded bg-[#21262D]" />
              <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[#21262D]" />
            </div>

            <div className="h-11 w-full animate-pulse rounded-xl bg-[#21262D] md:w-40" />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-xl bg-[#21262D]" />

                    <div className="flex-1">
                      <div className="h-5 w-40 animate-pulse rounded bg-[#21262D]" />
                      <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#21262D]" />
                    </div>
                  </div>

                  <div className="h-10 w-10 animate-pulse rounded-xl bg-[#21262D]" />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="h-3 w-40 animate-pulse rounded bg-[#21262D]" />
                    <div className="h-3 w-10 animate-pulse rounded bg-[#21262D]" />
                  </div>
                  <div className="h-2 animate-pulse rounded-full bg-[#21262D]" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  {Array.from({ length: 3 }).map((_, statIndex) => (
                    <div
                      key={statIndex}
                      className="rounded-xl bg-[#151B23] px-3 py-3 sm:px-4 sm:py-4"
                    >
                      <div className="h-3 w-12 animate-pulse rounded bg-[#21262D]" />
                      <div className="mt-2 h-5 w-16 animate-pulse rounded bg-[#21262D]" />
                    </div>
                  ))}
                </div>

                <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-[#21262D]" />
              </div>
            ))}
          </div>

          <aside className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5"
              >
                <div className="h-6 w-40 animate-pulse rounded bg-[#21262D]" />
                <div className="mt-2 h-4 w-56 animate-pulse rounded bg-[#21262D]" />

                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="h-14 animate-pulse rounded-xl bg-[#151B23]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </aside>
        </section>
      </div>
    </main>
  );
}