import {
  BarChart3,
  BellRing,
  Check,
  CreditCard,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import styles from "./product-visuals.module.css";

const chartBars = [35, 48, 41, 66, 54, 82, 72, 92, 74, 88, 70, 96];
const categories = [
  { label: "Shopping", value: "₹7,447", percentage: 36, color: "bg-[#58A6FF]" },
  { label: "Food", value: "₹5,320", percentage: 26, color: "bg-[#3FB950]" },
  { label: "Travel", value: "₹3,140", percentage: 15, color: "bg-[#D29922]" },
];

export function TrendChart({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={compact ? "flex h-20 items-end gap-1.5" : "flex h-36 items-end gap-2 sm:h-44"}
      aria-label="Spending trend preview"
      role="img"
    >
      {chartBars.map((height, index) => (
        <div key={`${height}-${index}`} className="group flex h-full flex-1 items-end">
          <span
            className={`${styles.chartBar} w-full rounded-t-sm transition-colors duration-200 ${
              index === chartBars.length - 1
                ? "bg-[#3FB950]"
                : "bg-[#58A6FF]/35 group-hover:bg-[#58A6FF]/55"
            }`}
            style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

export function BudgetBar({
  label,
  value,
  percentage,
  tone = "green",
}: {
  label: string;
  value: string;
  percentage: number;
  tone?: "green" | "blue" | "amber";
}) {
  const color =
    tone === "amber" ? "bg-[#D29922]" : tone === "blue" ? "bg-[#58A6FF]" : "bg-[#3FB950]";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="text-[#8B949E]">{label}</span>
        <span className="font-medium text-[#F0F6FC] tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#21262D]">
        <div className={`${styles.progressFill} h-full rounded-full ${color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}

export function HeroProductVisual() {
  const summary = [
    ["Month spend", "₹20,534"],
    ["Budget left", "₹9,466"],
    ["Subscriptions", "₹1,999"],
    ["No-spend", "3 days"],
  ];

  return (
    <div className="relative mx-auto w-full max-w-[620px] lg:mx-0">
      <div className="absolute -inset-8 -z-10 bg-[radial-gradient(circle,rgba(88,166,255,0.16),transparent_66%)] blur-2xl" />
      <div className="overflow-hidden rounded-[24px] border border-[#30363D] bg-[#0D1117] shadow-[0_35px_90px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between border-b border-[#21262D] px-4 py-3 sm:px-5">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-2 rounded-full bg-[#F85149]/80" />
            <span className="size-2 rounded-full bg-[#D29922]/80" />
            <span className="size-2 rounded-full bg-[#3FB950]/80" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#8B949E]">
            <span className={`${styles.liveDot} size-1.5 rounded-full bg-[#3FB950]`} />
            July overview
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 rounded-xl bg-[#161B22] px-3 py-2 sm:grid-cols-4 sm:px-4">
            {summary.map(([label, value], index) => (
              <div
                key={label}
                className={`min-w-0 px-2.5 py-2 sm:px-3 ${
                  index % 2 === 1 ? "border-l border-[#30363D]" : ""
                } ${index >= 2 ? "border-t border-[#30363D] sm:border-t-0" : ""} ${
                  index > 0 ? "sm:border-l" : "sm:border-l-0"
                }`}
              >
                <p className="truncate text-[9px] uppercase tracking-[0.08em] text-[#8B949E]">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold text-[#F0F6FC] tabular-nums sm:text-base">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
            <div className="min-w-0 rounded-xl bg-[#010409]/70 p-3.5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#F0F6FC]">Daily spending</p>
                  <p className="mt-0.5 text-[10px] text-[#8B949E]">Last 12 days</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#3FB950]">
                  <TrendingUp className="size-3" aria-hidden="true" /> 8% safer
                </span>
              </div>
              <TrendChart compact />
              <div className="mt-2 flex justify-between text-[9px] text-[#6E7681]"><span>06 Jul</span><span>Today</span></div>
            </div>

            <div className="flex flex-col justify-between gap-3">
              <div className="rounded-xl bg-[#010409]/70 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium text-[#F0F6FC]">Monthly budget</p>
                  <span className="text-[10px] font-medium text-[#3FB950]">Healthy</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-white tabular-nums">68%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#21262D]">
                  <div className={`${styles.progressFill} h-full w-[68%] rounded-full bg-[#3FB950]`} />
                </div>
                <p className="mt-2 text-[10px] text-[#8B949E]">₹9,466 remaining</p>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-[#58A6FF]/10 p-3 ring-1 ring-inset ring-[#58A6FF]/20">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-[#58A6FF]" aria-hidden="true" />
                <p className="text-[10px] leading-4 text-[#C9D1D9]">Shopping is 36% of this month&apos;s spend.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#161B22] px-3.5 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#A371F7]/12 text-[#BC8CFF]">
              <BellRing className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#F0F6FC]">ChatGPT Plus renews in 4 days</p>
              <p className="mt-0.5 text-[10px] text-[#8B949E]">Monthly subscription</p>
            </div>
            <p className="shrink-0 text-xs font-semibold text-white tabular-nums">₹1,999</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl border border-[#30363D] bg-[#161B22] px-3 py-2.5 shadow-2xl shadow-black/50 sm:flex">
        <span className="flex size-6 items-center justify-center rounded-full bg-[#3FB950]/12 text-[#3FB950]">
          <Check className="size-3.5" aria-hidden="true" />
        </span>
        <div><p className="text-[10px] text-[#8B949E]">Budget status</p><p className="text-xs font-medium text-[#F0F6FC]">On track this month</p></div>
      </div>
    </div>
  );
}

export function SubscriptionVisual() {
  return (
    <div className="mt-6 overflow-hidden rounded-xl bg-[#010409]/65">
      <div className="flex items-center justify-between border-b border-[#21262D] px-3.5 py-2.5">
        <span className="text-[10px] uppercase tracking-wider text-[#8B949E]">Upcoming renewals</span>
        <span className="text-[10px] font-medium text-[#D29922]">2 soon</span>
      </div>
      {[["ChatGPT Plus", "4 days", "₹1,999"], ["Netflix", "9 days", "₹199"]].map(([name, due, amount], index) => (
        <div key={name} className={`flex items-center gap-3 px-3.5 py-3 ${index ? "border-t border-[#21262D]" : ""}`}>
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#161B22] text-[#58A6FF]"><CreditCard className="size-3.5" aria-hidden="true" /></div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#F0F6FC]">{name}</p><p className="mt-0.5 text-[10px] text-[#8B949E]">Renews in {due}</p></div>
          <span className="text-xs font-semibold text-white tabular-nums">{amount}</span>
        </div>
      ))}
    </div>
  );
}

export function CategoryVisual() {
  return (
    <div className="mt-5 grid grid-cols-[84px_minmax(0,1fr)] items-center gap-4">
      <div className={`${styles.donut} flex size-20 items-center justify-center rounded-full bg-[conic-gradient(#58A6FF_0_36%,#3FB950_36%_62%,#D29922_62%_77%,#30363D_77%_100%)]`}>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#0D1117] text-[10px] font-semibold text-[#F0F6FC]">₹20.5k</div>
      </div>
      <div className="space-y-2.5">
        {categories.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between gap-2 text-[10px]"><span className="text-[#8B949E]">{item.label}</span><span className="text-[#F0F6FC]">{item.percentage}%</span></div>
            <div className="mt-1 h-1 rounded-full bg-[#21262D]"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetVisual() {
  return (
    <div className="mt-5 space-y-4 rounded-xl bg-[#010409]/60 p-3.5">
      <BudgetBar label="Food" value="₹5,320 / ₹8,000" percentage={66} />
      <BudgetBar label="Shopping" value="₹7,447 / ₹8,500" percentage={88} tone="amber" />
      <BudgetBar label="Travel" value="₹3,140 / ₹7,000" percentage={45} tone="blue" />
    </div>
  );
}

export function RecurringVisual() {
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-3">
      {[["Rent", "01 Aug", "₹18,000"], ["Internet", "05 Aug", "₹799"], ["Insurance", "12 Aug", "₹2,450"]].map(([name, date, amount], index) => (
        <div key={name} className="flex items-center gap-2.5 rounded-xl bg-[#010409]/60 px-3 py-2.5">
          <span className={`size-2 shrink-0 rounded-full ${index ? "bg-[#58A6FF]" : "bg-[#D29922]"}`} />
          <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium text-[#F0F6FC]">{name}</p><p className="mt-0.5 text-[9px] text-[#8B949E]">{date}</p></div>
          <span className="text-[10px] font-medium text-white tabular-nums">{amount}</span>
        </div>
      ))}
    </div>
  );
}

export function InsightsVisual() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#30363D] bg-[#0D1117] shadow-2xl shadow-black/25">
      <div className="flex items-center justify-between border-b border-[#21262D] px-4 py-3.5 sm:px-5">
        <div><p className="text-xs font-medium text-[#F0F6FC]">Spending analysis</p><p className="mt-0.5 text-[10px] text-[#8B949E]">July 2026</p></div>
        <span className="rounded-full bg-[#3FB950]/10 px-2.5 py-1 text-[10px] font-medium text-[#3FB950]">12% under pace</span>
      </div>
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_180px]">
        <div className="min-w-0">
          <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-[#8B949E]">Monthly trend</p><p className="mt-1 text-xl font-semibold text-white tabular-nums">₹20,534</p></div><p className="text-[10px] text-[#8B949E]">₹684 daily average</p></div>
          <div className="mt-5 rounded-xl bg-[#010409]/55 px-3 pt-3"><TrendChart /></div>
        </div>
        <div className="space-y-4 md:border-l md:border-[#30363D] md:pl-5">
          <div><p className="text-[10px] uppercase tracking-wider text-[#8B949E]">Budget health</p><div className="mt-2 flex items-baseline gap-1.5"><span className="text-2xl font-semibold text-[#3FB950]">68%</span><span className="text-[10px] text-[#8B949E]">used</span></div><div className="mt-2 h-1.5 rounded-full bg-[#21262D]"><div className={`${styles.progressFill} h-full w-[68%] rounded-full bg-[#3FB950]`} /></div></div>
          <div className="border-t border-[#21262D] pt-4"><p className="text-[10px] uppercase tracking-wider text-[#8B949E]">Category split</p><div className="mt-3 space-y-2">{categories.map((item) => <div key={item.label} className="flex items-center gap-2"><span className={`size-1.5 rounded-full ${item.color}`} /><span className="min-w-0 flex-1 truncate text-[10px] text-[#8B949E]">{item.label}</span><span className="text-[10px] text-[#F0F6FC]">{item.value}</span></div>)}</div></div>
        </div>
      </div>
      <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-xl bg-[#58A6FF]/10 px-3.5 py-3 ring-1 ring-inset ring-[#58A6FF]/20 sm:mx-5 sm:mb-5">
        <BarChart3 className="mt-0.5 size-3.5 shrink-0 text-[#58A6FF]" aria-hidden="true" />
        <p className="text-[11px] leading-4 text-[#C9D1D9]">Shopping is your highest category at ₹7,447 — 36% of this month&apos;s spending.</p>
      </div>
    </div>
  );
}

