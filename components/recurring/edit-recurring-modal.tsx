"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { BillingCycle, RecurringCategory } from "@/app/generated/prisma/client";

import { updateRecurring } from "@/actions/recurring/update-recurring";
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

export default function EditRecurringModal() {
  const router = useRouter();

  const { editOpen, selectedRecurring, onEditClose } =
    useRecurringModalStore();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("HOUSING");
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>();
  const [note, setNote] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedRecurring) return;

    setName(selectedRecurring.name);
    setAmount(String(selectedRecurring.amount));
    setCategory(selectedRecurring.category);
    setBillingCycle(selectedRecurring.billingCycle);
    setNextDueDate(new Date(selectedRecurring.nextDueDate));
    setNote(selectedRecurring.note || "");
    setIsActive(selectedRecurring.isActive);
  }, [selectedRecurring]);

  function handleClose() {
    if (isSubmitting) return;
    onEditClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRecurring) return;

    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    if (!nextDueDate) {
      alert("Next due date is required");
      return;
    }

    setIsSubmitting(true);

    const selectedDate = new Date(nextDueDate);
    selectedDate.setHours(12, 0, 0, 0);

    const res = await updateRecurring({
      id: selectedRecurring.id,
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
      alert(res.error);
      return;
    }

    onEditClose();
    router.refresh();
  }

  return (
    <Dialog
      open={editOpen}
      onOpenChange={(value) => (!value ? handleClose() : null)}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#3D444D] bg-[#0D1117] text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Recurring Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#C9D1D9]">
              Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="House Rent, Electricity Bill, EMI..."
              className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#C9D1D9]">
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
                className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#C9D1D9]">
                Category
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF]"
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#C9D1D9]">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(event) => {
                  setBillingCycle(event.target.value);
                  setNextDueDate(undefined);
                }}
                className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF]"
              >
                {billingCycles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#C9D1D9]">
                Next Due Date
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-left text-sm text-white outline-none hover:border-[#58A6FF]"
                  >
                    {nextDueDate ? (
                      format(nextDueDate, "dd MMM yyyy")
                    ) : (
                      <span className="text-[#6E7681]">Pick a date</span>
                    )}

                    <CalendarIcon size={16} className="text-[#6E7681]" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-auto border-[#3D444D] bg-[#0D1117] p-0 text-white"
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
            <label className="text-sm font-medium text-[#C9D1D9]">
              Note optional
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Paid to landlord, auto debit, etc."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#3D444D] bg-[#010409] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#3D444D] bg-[#010409] px-3 py-3">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-[#8B949E]">
                Active recurring expenses count in stats.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full transition ${
                isActive ? "bg-[#238636]" : "bg-[#3D444D]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  isActive ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm font-medium text-[#C9D1D9] transition hover:bg-[#21262D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}