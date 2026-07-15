import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1440px] min-w-0 space-y-5 lg:space-y-6", className)} {...props} />;
}

export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("rounded-xl border border-border/80 bg-card p-4 sm:p-5", className)} {...props} />;
}

export function SectionHeader({ title, description, action, className }: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ title, value, subtitle, icon: Icon, className }: {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ElementType;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-xl bg-card p-4 ring-1 ring-border/70", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
          {subtitle ? <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {Icon ? <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"><Icon className="size-4" /></div> : null}
      </div>
    </div>
  );
}

export function FilterBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl bg-card p-3 ring-1 ring-border/70 sm:p-4", className)} {...props} />;
}

const badgeStyles = {
  success: "bg-green-500/10 text-green-400 ring-green-500/20",
  info: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  warning: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  danger: "bg-red-500/10 text-red-400 ring-red-500/20",
  neutral: "bg-muted text-muted-foreground ring-border",
} as const;

export function StatusBadge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof badgeStyles }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", badgeStyles[tone], className)} {...props} />;
}

export function EmptyState({ icon: Icon, title, description, action, className }: {
  icon?: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border px-6 py-12 text-center", className)}>
      {Icon ? <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><Icon className="size-5" /></div> : null}
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} {...props} />;
}