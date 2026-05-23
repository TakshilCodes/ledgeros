export default function Loading() {
  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-[#010409] px-4 py-6 text-[#C9D1D9] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 overflow-x-hidden">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-4 w-20 animate-pulse rounded bg-[#21262D]" />
            <div className="mt-3 h-8 w-56 animate-pulse rounded bg-[#21262D]" />
            <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-[#21262D]" />
          </div>

          <div className="h-11 w-36 animate-pulse rounded-xl bg-[#21262D]" />
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between md:hidden">
            <div className="h-3 w-16 animate-pulse rounded bg-[#21262D]" />
            <div className="h-3 w-28 animate-pulse rounded bg-[#21262D]" />
          </div>

          <div className="relative max-w-full overflow-hidden">
            <div className="scrollbar-hide flex max-w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="min-w-57.5 snap-start rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 shadow-sm md:min-w-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-24 animate-pulse rounded bg-[#21262D]" />
                      <div className="mt-3 h-7 w-28 animate-pulse rounded bg-[#21262D]" />
                      <div className="mt-2 h-3 w-36 animate-pulse rounded bg-[#21262D]" />
                    </div>

                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-[#21262D]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-3 right-0 top-0 w-12 bg-linear-to-l from-[#010409] to-transparent md:hidden" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="h-11 animate-pulse rounded-xl bg-[#151B23]" />
            <div className="h-11 animate-pulse rounded-xl bg-[#151B23]" />
            <div className="h-11 animate-pulse rounded-xl bg-[#151B23]" />
            <div className="h-11 animate-pulse rounded-xl bg-[#151B23]" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#3D444D] bg-[#010409] p-4"
              >
                <div className="hidden items-center justify-between gap-4 md:flex">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-[#21262D]" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-32 animate-pulse rounded bg-[#21262D]" />
                        <div className="h-5 w-14 animate-pulse rounded-full bg-[#21262D]" />
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-[#21262D]" />
                        <div className="h-4 w-40 animate-pulse rounded bg-[#21262D]" />
                      </div>

                      <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-[#21262D]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-6 w-20 animate-pulse rounded bg-[#21262D]" />
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-[#21262D]" />
                  </div>
                </div>

                <div className="md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[#21262D]" />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="h-5 w-28 animate-pulse rounded bg-[#21262D]" />
                          <div className="h-5 w-14 animate-pulse rounded-full bg-[#21262D]" />
                        </div>

                        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#21262D]" />
                      </div>
                    </div>

                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-[#21262D]" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[#151B23] px-3 py-3">
                      <div className="h-3 w-16 animate-pulse rounded bg-[#21262D]" />
                      <div className="mt-2 h-5 w-24 animate-pulse rounded bg-[#21262D]" />
                    </div>

                    <div className="rounded-xl bg-[#151B23] px-3 py-3">
                      <div className="h-3 w-14 animate-pulse rounded bg-[#21262D]" />
                      <div className="mt-2 h-5 w-20 animate-pulse rounded bg-[#21262D]" />
                    </div>
                  </div>

                  <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-[#21262D]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}