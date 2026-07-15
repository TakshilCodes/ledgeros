"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteAccountAction } from "@/actions/settings/deleteAccount";

type DeleteAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const isDeleteEnabled = confirmationText === "DELETE";

  function handleDeleteAccount() {
    if (!isDeleteEnabled) return;

    startTransition(async () => {
      const result = await deleteAccountAction({
        confirmationText,
      });

      if (result && !result.success) {
        toast.error(result.message);
      }
    });
  }

  function handleClose() {
    if (isPending) return;

    setConfirmationText("");
    onOpenChange(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-lg overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-muted px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <h2 id="delete-account-title" className="text-sm font-semibold text-white">
                Delete account
              </h2>
              <p className="text-xs text-muted-foreground">
                This action is permanent
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close delete account dialog"
            disabled={isPending}
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-card hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-semibold text-red-400">
              You are about to delete your LedgerOS account.
            </p>
            <p className="mt-2 text-xs leading-5 text-foreground">
              All expenses, subscriptions, recurring expenses, budgets, and
              account data will be permanently removed. This cannot be undone.
            </p>
          </div>

          <div>
            <label
              htmlFor="delete-confirmation"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Type <span className="font-semibold text-red-400">DELETE</span>{" "}
              to confirm
            </label>

            <input
              id="delete-confirmation"
              type="text"
              value={confirmationText}
              disabled={isPending}
              onChange={(event) => setConfirmationText(event.target.value)}
              placeholder="DELETE"
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-white outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isPending}
              onClick={handleClose}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-foreground transition hover:bg-[#1f2630] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!isDeleteEnabled || isPending}
              onClick={handleDeleteAccount}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete account"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}