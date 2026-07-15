import type { ElementType } from "react";

import { cn } from "@/lib/utils";

export type FinancialSummaryItem = {
  label: string;
  value: string;
  supportingText?: string;
  icon?: ElementType;
  tone?: "default" | "danger" | "warning";
};

export function FinancialSummary({
  items,
}: {
  items: FinancialSummaryItem[];
}) {
  return (
    <section
      aria-label="Financial summary"
      className="grid min-w-0 grid-cols-2 overflow-hidden rounded-xl border border-border/70 bg-card px-2.5 md:grid-cols-4 md:px-4"
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className={cn(
              "relative flex min-w-0 items-center gap-1.5 px-2 py-2 md:gap-2 md:border-l-0 md:border-t-0 md:px-4 md:py-2.5 md:first:pl-0 md:last:pr-0",
              index >= 2 && "border-t border-border/70 md:border-t-0",
              index % 2 === 1 &&
                "border-l border-border/70 md:border-l-0",
              index < items.length - 1 &&
                "md:after:absolute md:after:inset-y-[20%] md:after:right-0 md:after:w-px md:after:bg-border/90"
            )}
          >
            {Icon ? (
              <div className="hidden size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-blue-400 md:flex">
                <Icon className="size-3.5" aria-hidden="true" />
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase leading-tight tracking-[0.06em] text-muted-foreground md:tracking-[0.08em]">
                <span>{item.label}</span>
                {Icon ? (
                  <span className="flex size-4 shrink-0 items-center justify-center text-blue-400 md:hidden">
                    <Icon className="size-3" aria-hidden="true" />
                  </span>
                ) : null}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-lg font-semibold leading-tight tracking-tight text-foreground tabular-nums [overflow-wrap:anywhere] md:truncate md:text-xl",
                  item.tone === "danger" && "text-red-400",
                  item.tone === "warning" && "text-amber-300"
                )}
              >
                {item.value}
              </p>
              {item.supportingText ? (
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground [overflow-wrap:anywhere] md:truncate md:text-xs">
                  {item.supportingText}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}