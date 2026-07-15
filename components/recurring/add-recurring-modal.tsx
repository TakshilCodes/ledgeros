"use client";

import { StyledSelect } from "@/components/ui/select";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { BillingCycle, RecurringCategory } from "@/app/generated/prisma/client";

import { createRecurring } from "@/actions/recurring/create-recurring";
import { useRecurringModalStore } from "@/store/recurring-modal-store";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

const categories = [
  { label: "Housing", value: "HOUSING" },
  { label: "Utilities", value: "UTILITIES" },
  { label: "EMI", value: "EMI" },
  { label: "Education", value: "EDUCATION" },
  { label: "Health", value: "HEALTH" },
  { label: "Insurance", value: "INSURANCE" },
  { label: "Investment", value: "INVESTMENT" },
  { label: "Internet / Phone", value: "INTERNET_PHONE" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Other", value: "OTHER" },
];

const billingCycles = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Half-Yearly", value: "HALF_YEARLY" },
  { label: "Yearly", value: "YEARLY" },
];

function getMaxAllowedDueDate(billingCycle: string) {
  const maxDate = new Date();

  if (billingCycle === "MONTHLY") maxDate.setMonth(maxDate.getMonth() + 2);
  if (billingCycle === "QUARTERLY") maxDate.setMonth(maxDate.getMonth() + 4);
  if (billingCycle === "HALF_YEARLY") maxDate.setMonth(maxDate.getMonth() + 7);
  if (billingCycle === "YEARLY") maxDate.setMonth(maxDate.getMonth() + 13);

  maxDate.setHours(23, 59, 59, 999);

  return maxDate;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function AddRecurringModal() {
  const router = useRouter();
  const { open, onClose } = useRecurringModalStore();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("HOUSING");
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>();
  const [note, setNote] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setAmount("");
    setCategory("HOUSING");
    setBillingCycle("MONTHLY");
    setNextDueDate(undefined);
    setNote("");
    setIsActive(true);
    setError("");
  }

  function handleClose() {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!nextDueDate) {
      setError("Next due date is required");
      return;
    }

    setIsSubmitting(true);

    const selectedDate = new Date(nextDueDate);
    selectedDate.setHours(12, 0, 0, 0);

    const res = await createRecurring({
      name,
      amount: Number(amount),
      category: category as RecurringCategory,
      billingCycle: billingCycle as BillingCycle,
      nextDueDate: selectedDate,
      note: note.trim() || null,
      isActive,
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError(res.error || "Something went wrong");
      return;
    }

    resetForm();
    onClose();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? handleClose() : null)}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto border-border/70 bg-card p-0 text-foreground shadow-2xl sm:max-w-xl">
        <DialogHeader className="sticky top-0 z-10 border-b border-border/70 bg-card px-5 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
            Add Recurring Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 ring-1 ring-red-500/20 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="House Rent, Electricity Bill, EMI..."
              className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Amount
              </label>
              <input
                value={amount}
                onChange={(event) => {
                  const value = event.target.value;
                  if (Number(value) < 0) return;
                  setAmount(value);
                }}
                type="number"
                min="0"
                placeholder="12000"
                className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Category
              </label>
              <StyledSelect
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </StyledSelect>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Billing Cycle
              </label>
              <StyledSelect
                value={billingCycle}
                onChange={(event) => {
                  setBillingCycle(event.target.value);
                  setNextDueDate(undefined);
                }}
                className="h-10 w-full cursor-pointer rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              >
                {billingCycles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </StyledSelect>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Next Due Date
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-border/80 bg-background px-3 text-left text-sm text-foreground outline-none transition-colors hover:border-border focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15"
                  >
                    {nextDueDate ? (
                      format(nextDueDate, "dd MMM yyyy")
                    ) : (
                      <span className="text-muted-foreground/70">Pick a date</span>
                    )}

                    <CalendarIcon size={16} className="text-muted-foreground/70" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-auto border-border bg-card p-0 text-white"
                >
                  <Calendar
                    mode="single"
                    selected={nextDueDate}
                    onSelect={setNextDueDate}
                    captionLayout="dropdown"
                    fixedWeeks
                    startMonth={new Date(new Date().getFullYear(), 0)}
                    endMonth={new Date(new Date().getFullYear() + 10, 11)}
                    disabled={(date) => {
                      return (
                        date < getToday() ||
                        date > getMaxAllowedDueDate(billingCycle)
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Note optional
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Paid to landlord, auto debit, etc."
              rows={3}
              className="min-h-20 w-full resize-none rounded-lg border border-border/80 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5 ring-1 ring-border/60">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-muted-foreground">
                Active recurring expenses count in stats.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label="Set recurring expense active status"
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition cursor-pointer ${isActive ? "bg-primary" : "bg-muted-foreground/40"
                }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${isActive ? "left-6" : "left-1"
                  }`}
              />
            </button>
          </div>

          <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-5 flex flex-col-reverse gap-2 border-t border-border/70 bg-card/95 px-5 py-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add Recurring
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}