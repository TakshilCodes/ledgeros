"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import DeleteAccountDialog from "@/components/settings/DeleteAccountDialog";

export default function DangerZoneCard() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-red-500/25 bg-card">
        <div className="flex items-start gap-2.5 px-4 py-4 sm:px-5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="size-4 text-red-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Danger zone</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanent actions that cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-red-500/20 bg-red-500/5 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Delete LedgerOS account
            </p>
            <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
              Permanently deletes your profile and all expenses, subscriptions,
              budgets, recurring expenses, and related account data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete account
          </button>
        </div>
      </section>

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
