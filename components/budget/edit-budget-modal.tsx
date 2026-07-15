"use client";

import { StyledSelect } from "@/components/ui/select";

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
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-xl border-border/70 bg-card p-0 text-foreground shadow-2xl sm:max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-border/70 bg-card px-5 py-4 pr-12 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
              Edit Budget
            </DialogTitle>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Update your budget amount, type, month, or category.
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <div className="space-y-3">
            <label className="block text-xs font-medium text-muted-foreground">
              Budget Type
            </label>

            <div className="grid gap-2 sm:grid-cols-3">
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
                    className={`min-h-20 cursor-pointer rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                      isSelected
                        ? "border-primary/60 bg-primary/10"
                        : "border-border/70 bg-muted/40 hover:border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      {budgetType.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                      {budgetType.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="edit-budget-name"
                className="block text-xs font-medium text-muted-foreground"
              >
                Budget Name
              </label>

              <input
                id="edit-budget-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Monthly Budget"
                className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-budget-amount"
                className="block text-xs font-medium text-muted-foreground"
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
                className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          {type === "CATEGORY" ? (
            <div className="space-y-2">
              <label
                htmlFor="edit-budget-category"
                className="block text-xs font-medium text-muted-foreground"
              >
                Category
              </label>

              <StyledSelect
                id="edit-budget-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Select category</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {formatCategory(item)}
                  </option>
                ))}
              </StyledSelect>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="edit-budget-month"
                className="block text-xs font-medium text-muted-foreground"
              >
                Month
              </label>

              <StyledSelect
                id="edit-budget-month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="cursor-pointer h-10 w-full cursor-pointer rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              >
                {getMonthOptions().map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </StyledSelect>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-budget-year"
                className="block text-xs font-medium text-muted-foreground"
              >
                Year
              </label>

              <StyledSelect
                id="edit-budget-year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              >
                {getYearOptions().map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </StyledSelect>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-5 flex flex-col-reverse gap-2 border-t border-border/70 bg-card/95 px-5 py-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              disabled={isPending}
              onClick={handleClose}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
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