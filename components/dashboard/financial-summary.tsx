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
      className="grid min-w-0 grid-cols-1 overflow-hidden rounded-xl border border-border/70 bg-card px-3.5 py-0.5 sm:grid-cols-2 sm:px-4 xl:grid-cols-4"
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className={cn(
              "relative flex min-w-0 items-center gap-2.5 py-2.5",
              index > 0 && "border-t border-border sm:border-t-0",
              index >= 2 && "sm:border-t sm:border-border xl:border-t-0",
              index % 2 === 1 &&
                "sm:before:absolute sm:before:inset-y-[20%] sm:before:left-0 sm:before:w-px sm:before:bg-border/90 xl:before:hidden",
              index < items.length - 1 &&
                "xl:after:absolute xl:after:inset-y-[20%] xl:after:right-0 xl:after:w-px xl:after:bg-border/90",
              "sm:px-4 sm:first:pl-0 xl:first:pl-0 xl:last:pr-0"
            )}
          >
            {Icon ? (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-blue-400">
                <Icon className="size-3.5" aria-hidden="true" />
              </div>
            ) : null}

            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {item.label}
              </p>
              <p
                className={cn(
                  "mt-0.5 truncate text-xl font-semibold tracking-tight text-foreground tabular-nums",
                  item.tone === "danger" && "text-red-400",
                  item.tone === "warning" && "text-amber-300"
                )}
              >
                {item.value}
              </p>
              {item.supportingText ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
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