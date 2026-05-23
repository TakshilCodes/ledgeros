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
    <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23]">
          <FileSpreadsheet className="h-5 w-5 text-[#3FB950]" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">Data Export</h2>
          <p className="mt-1 text-sm text-[#8B949E]">
            Download your account data in CSV format.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {exportItems.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => handleExport(item.href)}
            className="group flex w-full items-center justify-between cursor-pointer gap-4 rounded-xl border border-[#3D444D] bg-[#151B23] p-4 text-left transition hover:border-[#58A6FF]/60 hover:bg-[#1f2630]"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-[#8B949E]">
                {item.description}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#3D444D] bg-[#0D1117] transition group-hover:border-[#58A6FF]/60">
              <Download className="h-4 w-4 text-[#8B949E] transition group-hover:text-[#58A6FF]" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#238636]/30 bg-[#238636]/10 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3FB950]" />
        <p className="text-xs leading-5 text-[#8B949E]">
          Exports only include data from your own account.
        </p>
      </div>
    </section>
  );
}