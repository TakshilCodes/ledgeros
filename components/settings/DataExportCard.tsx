"use client";

import { Download, FileSpreadsheet, ShieldCheck } from "lucide-react";

const exportItems = [
  {
    title: "Expenses",
    description: "Download all expense records as CSV.",
    href: "/api/export/expenses",
  },
  {
    title: "Subscriptions",
    description: "Download all subscription records as CSV.",
    href: "/api/export/subscriptions",
  },
];

export default function DataExportCard() {
  function handleExport(href: string) {
    window.location.href = href;
  }

  return (
    <section className="border-t border-border/70">
      <div className="flex items-start gap-2.5 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileSpreadsheet className="size-4 text-green-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Data export</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Download your records as CSV.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/60 border-t border-border/60 px-4">
        {exportItems.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => handleExport(item.href)}
            className="group flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                {item.description}
              </p>
            </div>
            <Download className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-green-400" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 border-t border-border/60 px-4 py-3">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-green-400" aria-hidden="true" />
        <p className="text-[11px] leading-4 text-muted-foreground">
          Exports only include data from your account.
        </p>
      </div>
    </section>
  );
}
