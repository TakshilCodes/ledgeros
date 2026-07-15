import { LoadingSkeleton } from "@/components/ui/foundation";

function SummarySkeleton() {
  return (
    <div className="grid overflow-hidden rounded-xl border border-border/70 bg-card sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="relative flex min-h-24 items-center gap-3 px-4 py-3.5 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-border/70 sm:after:hidden lg:after:absolute lg:after:inset-y-[22%] lg:after:right-0 lg:after:left-auto lg:after:h-auto lg:after:w-px lg:after:bg-border/80 last:after:hidden">
          <LoadingSkeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <LoadingSkeleton className="h-3 w-24" />
            <LoadingSkeleton className="h-6 w-28" />
            <LoadingSkeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.5fr)_minmax(9rem,.8fr)_minmax(8rem,.65fr)_auto] md:items-center">
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-44 max-w-full" />
        <LoadingSkeleton className="h-3 w-56 max-w-full" />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton className="h-3 w-24" />
        <LoadingSkeleton className="h-3 w-32" />
      </div>
      <div className="space-y-2 md:text-right">
        <LoadingSkeleton className="h-5 w-24 md:ml-auto" />
        <LoadingSkeleton className="h-3 w-20 md:ml-auto" />
      </div>
      <div className="flex gap-2 md:justify-end">
        <LoadingSkeleton className="h-9 w-24 rounded-lg" />
        <LoadingSkeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="w-full min-w-0 space-y-4 text-foreground">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <LoadingSkeleton className="h-7 w-48" />
          <LoadingSkeleton className="h-4 w-72 max-w-full" />
        </div>
        <LoadingSkeleton className="h-10 w-40 rounded-lg" />
      </div>
      <SummarySkeleton />
      <div className="grid gap-2 rounded-xl border border-border/60 bg-card/60 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(12rem,1.5fr)_repeat(4,minmax(8rem,1fr))_auto]">
        {Array.from({ length: 5 }).map((_, index) => <LoadingSkeleton key={index} className="h-10 rounded-lg" />)}
        <LoadingSkeleton className="h-10 w-full rounded-lg lg:w-20" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="border-b border-border/70 px-4 py-3"><LoadingSkeleton className="h-4 w-40" /></div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, index) => <RowSkeleton key={index} />)}
        </div>
      </div>
    </div>
  );
}
