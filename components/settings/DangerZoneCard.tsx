"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import DeleteAccountDialog from "@/components/settings/DeleteAccountDialog";

export default function DangerZoneCard() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <section className="rounded-2xl border border-red-500/30 bg-[#0D1117] p-4 sm:p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Danger Zone
            </h2>
            <p className="mt-1 text-sm text-[#8B949E]">
              Permanent actions that cannot be undone.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Delete LedgerOS account
              </p>
              <p className="mt-1 max-w-xl text-xs leading-5 text-[#8B949E]">
                This will permanently delete your profile, expenses,
                subscriptions, budgets, recurring expenses, and all related
                account data.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex cursor-pointer h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Delete account
            </button>
          </div>
        </div>
      </section>

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}