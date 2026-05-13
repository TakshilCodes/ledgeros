export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-16 rounded-xl border border-[#3D444D] bg-[#0D1117]" />

      <div className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
        <div className="grid gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-xl border border-[#3D444D] bg-[#0D1117]"
            />
          ))}
        </div>
      </div>

      <div className="h-16 rounded-xl border border-[#3D444D] bg-[#0D1117]" />

      <section className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-3">
        <div className="mb-3 h-5 w-28 rounded bg-[#151B23]" />
        <ExpenseListSkeleton />
      </section>
    </div>
  );
}

function ExpenseListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-xl border border-[#3D444D] bg-[#010409] p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#151B23]" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-[#151B23]" />
              <div className="h-3 w-48 rounded bg-[#151B23]" />
              <div className="h-3 w-56 rounded bg-[#151B23]" />
            </div>

            <div className="h-4 w-16 rounded bg-[#151B23]" />
          </div>
        </div>
      ))}
    </div>
  );
}