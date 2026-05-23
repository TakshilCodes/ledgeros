"use client";

import { updateBudget } from "@/actions/budgets/update-budget";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBudgetModalStore } from "@/store/budget-modal-store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

const budgetTypes = [
  {
    label: "Monthly Budget",
    value: "MONTHLY",
    description: "Track your total monthly spending limit.",
  },
  {
    label: "Category Budget",
    value: "CATEGORY",
    description: "Set a limit for one spending category.",
  },
  {
    label: "Daily Limit",
    value: "DAILY_LIMIT",
    description: "Control your everyday spending.",
  },
];

const categories = [
  "FOOD",
  "TRAVEL",
  "SHOPPING",
  "SUBSCRIPTION",
  "OTHER",
] as const;

function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function formatCategory(category: string) {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function getMonthOptions() {
  return [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 6 }, (_, index) => currentYear - 1 + index);
}

export default function EditBudgetModal() {
  const router = useRouter();

  const { editOpen, selectedBudget, onEditClose } = useBudgetModalStore();

  const currentMonthYear = useMemo(() => getCurrentMonthYear(), []);

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [type, setType] = useState("MONTHLY");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(String(currentMonthYear.month));
  const [year, setYear] = useState(String(currentMonthYear.year));

  useEffect(() => {
    if (!selectedBudget) return;

    setName(selectedBudget.name || "");
    setType(selectedBudget.type);
    setCategory(selectedBudget.category || "");
    setAmount(String(selectedBudget.amount));
    setMonth(String(selectedBudget.month));
    setYear(String(selectedBudget.year));
  }, [selectedBudget]);

  function handleClose() {
    if (isPending) return;

    onEditClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBudget) {
      toast.error("Budget not found");
      return;
    }

    const numericAmount = Number(amount);
    const numericMonth = Number(month);
    const numericYear = Number(year);

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Budget amount must be greater than 0");
      return;
    }

    if (!numericMonth || numericMonth < 1 || numericMonth > 12) {
      toast.error("Invalid budget month");
      return;
    }

    if (!numericYear || numericYear < 2020 || numericYear > 2100) {
      toast.error("Invalid budget year");
      return;
    }

    if (type === "CATEGORY" && !category) {
      toast.error("Please select a category");
      return;
    }

    startTransition(async () => {
      const result = await updateBudget(selectedBudget.id, {
        name: name.trim() || undefined,
        type: type as "MONTHLY" | "CATEGORY" | "DAILY_LIMIT",
        category: type === "CATEGORY" ? (category as any) : null,
        amount: numericAmount,
        month: numericMonth,
        year: numericYear,
      });

      if (!result.ok) {
        toast.error(result.error || "Failed to update budget");
        return;
      }

      toast.success(result.message || "Budget updated successfully");
      onEditClose();
      router.refresh();
    });
  }

  return (
    <Dialog open={editOpen} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-[#3D444D] bg-[#0D1117] p-0 text-[#C9D1D9] shadow-2xl sm:max-w-2xl">
        <div className="border-b border-[#21262D] px-5 py-5 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight text-white">
              Edit Budget
            </DialogTitle>
            <p className="mt-1 text-sm leading-6 text-[#8B949E]">
              Update your budget amount, type, month, or category.
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-5 py-5 sm:px-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#C9D1D9]">
              Budget Type
            </label>

            <div className="grid gap-3 md:grid-cols-3">
              {budgetTypes.map((budgetType) => {
                const isSelected = type === budgetType.value;

                return (
                  <button
                    key={budgetType.value}
                    type="button"
                    onClick={() => {
                      setType(budgetType.value);

                      if (budgetType.value !== "CATEGORY") {
                        setCategory("");
                      }
                    }}
                    className={`min-h-26 rounded-2xl border p-4 text-left transition cursor-pointer ${
                      isSelected
                        ? "border-[#238636] bg-[#238636]/10 shadow-[0_0_0_1px_rgba(35,134,54,0.35)]"
                        : "border-[#3D444D] bg-[#151B23] hover:border-[#58A6FF]/50 hover:bg-[#21262D]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      {budgetType.label}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#8B949E]">
                      {budgetType.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="edit-budget-name"
                className="block text-sm font-semibold text-[#C9D1D9]"
              >
                Budget Name
              </label>

              <input
                id="edit-budget-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Monthly Budget"
                className="h-12 w-full rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm font-medium text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/10"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-budget-amount"
                className="block text-sm font-semibold text-[#C9D1D9]"
              >
                Amount
              </label>

              <input
                id="edit-budget-amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                min="1"
                placeholder="18000"
                className="h-12 w-full rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm font-medium text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/10"
              />
            </div>
          </div>

          {type === "CATEGORY" ? (
            <div className="space-y-2">
              <label
                htmlFor="edit-budget-category"
                className="block text-sm font-semibold text-[#C9D1D9]"
              >
                Category
              </label>

              <select
                id="edit-budget-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm font-medium text-white outline-none transition focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/10"
              >
                <option value="">Select category</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {formatCategory(item)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="edit-budget-month"
                className="block text-sm font-semibold text-[#C9D1D9]"
              >
                Month
              </label>

              <select
                id="edit-budget-month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="cursor-pointer h-12 w-full rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm font-medium text-white outline-none transition focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/10"
              >
                {getMonthOptions().map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-budget-year"
                className="block text-sm font-semibold text-[#C9D1D9]"
              >
                Year
              </label>

              <select
                id="edit-budget-year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm font-medium text-white outline-none transition focus:border-[#58A6FF] focus:ring-2 focus:ring-[#58A6FF]/10"
              >
                {getYearOptions().map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#21262D] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isPending}
              onClick={handleClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] px-5 text-sm font-semibold text-[#C9D1D9] transition hover:bg-[#21262D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#238636] px-5 text-sm font-semibold text-white transition hover:bg-[#2EA043] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}