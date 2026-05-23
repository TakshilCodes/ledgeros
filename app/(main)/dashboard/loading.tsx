export default function Loading() {
  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-[#010409] px-4 py-6 text-[#C9D1D9] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5 overflow-x-hidden">
        {/* Header */}
        <section>
          <div className="h-7 w-56 animate-pulse rounded bg-[#21262D]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[#21262D]" />
        </section>

        {/* Summary cards */}
        <section className="relative max-w-full overflow-hidden">
          <div className="scrollbar-hide flex max-w-full gap-3 overflow-x-auto pb-2 xl:grid xl:grid-cols-4 xl:overflow-visible">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-w-57.5 rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-[#21262D]" />

                    <div className="mt-4 h-3 w-24 animate-pulse rounded bg-[#21262D]" />
                    <div className="mt-3 h-7 w-28 animate-pulse rounded bg-[#21262D]" />
                    <div className="mt-3 h-3 w-36 animate-pulse rounded bg-[#21262D]" />
                  </div>

                  <div className="h-4 w-4 animate-pulse rounded bg-[#21262D]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Alert */}
        <section className="rounded-xl border border-[#3D444D] bg-[#0D1117] px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded bg-[#21262D]" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-[#21262D]" />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            {/* Expense Overview */}
            <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="h-5 w-36 animate-pulse rounded bg-[#21262D]" />
                  <div className="mt-2 h-3 w-52 animate-pulse rounded bg-[#21262D]" />
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="flex min-h-55 items-center justify-center rounded-xl border border-[#3D444D] bg-[#010409] p-4">
                  <div className="h-36 w-36 animate-pulse rounded-full bg-[#21262D]" />
                </div>

                <div className="rounded-xl border border-[#3D444D] bg-[#010409] p-4">
                  <div className="space-y-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="h-3 w-24 animate-pulse rounded bg-[#21262D]" />
                          <div className="h-3 w-20 animate-pulse rounded bg-[#21262D]" />
                        </div>

                        <div className="h-2 animate-pulse rounded-full bg-[#21262D]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Expenses + Upcoming Renewals */}
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-5 w-36 animate-pulse rounded bg-[#21262D]" />
                    <div className="h-3 w-14 animate-pulse rounded bg-[#21262D]" />
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 rounded-xl bg-[#010409] px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[#21262D]" />

                          <div className="min-w-0">
                            <div className="h-4 w-28 animate-pulse rounded bg-[#21262D]" />
                            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-[#21262D]" />
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="h-4 w-16 animate-pulse rounded bg-[#21262D]" />
                          <div className="mt-2 h-3 w-14 animate-pulse rounded bg-[#21262D]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            {/* Budget Overview */}
            <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <div className="h-5 w-32 animate-pulse rounded bg-[#21262D]" />
                  <div className="mt-2 h-3 w-44 animate-pulse rounded bg-[#21262D]" />
                </div>

                <div className="h-7 w-24 animate-pulse rounded-full bg-[#21262D]" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="h-4 w-24 animate-pulse rounded bg-[#21262D]" />
                  <div className="h-4 w-20 animate-pulse rounded bg-[#21262D]" />
                </div>

                <div className="h-2 animate-pulse rounded-full bg-[#21262D]" />
                <div className="mt-3 h-3 w-36 animate-pulse rounded bg-[#21262D]" />
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-4 w-32 animate-pulse rounded bg-[#21262D]" />
                  <div className="h-3 w-8 animate-pulse rounded bg-[#21262D]" />
                </div>

                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-[#21262D]" />
                        <div className="h-3 w-24 animate-pulse rounded bg-[#21262D]" />
                      </div>

                      <div className="h-2 animate-pulse rounded-full bg-[#21262D]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* No Spend Streak */}
            <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-pulse rounded bg-[#21262D]" />
                <div className="h-5 w-36 animate-pulse rounded bg-[#21262D]" />
              </div>

              <div className="mt-4 h-8 w-24 animate-pulse rounded bg-[#21262D]" />
              <div className="mt-2 h-4 w-44 animate-pulse rounded bg-[#21262D]" />

              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-2 h-3 w-3 animate-pulse rounded bg-[#21262D]" />
                    <div className="h-7 w-7 animate-pulse rounded-full bg-[#21262D]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Report */}
            <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-5 w-32 animate-pulse rounded bg-[#21262D]" />
                <div className="h-3 w-16 animate-pulse rounded bg-[#21262D]" />
              </div>

              <div className="h-3 w-20 animate-pulse rounded bg-[#21262D]" />
              <div className="mt-2 h-8 w-28 animate-pulse rounded bg-[#21262D]" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-[#21262D]" />

              <div className="mt-4 rounded-xl bg-[#010409] p-3">
                <div className="flex items-start gap-2">
                  <div className="h-4 w-4 animate-pulse rounded bg-[#21262D]" />

                  <div className="flex-1">
                    <div className="h-4 w-40 animate-pulse rounded bg-[#21262D]" />
                    <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#21262D]" />
                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-[#21262D]" />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}