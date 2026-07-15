"use client";

import { useEffect, useRef, useState } from "react";
import { format, isToday } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Car,
  CreditCard,
  MoreVertical,
  Pencil,
  ReceiptText,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";

import { getExpenses } from "@/actions/expense/getExpenses";
import { deleteExpense } from "@/actions/expense/deleteExpense";
import { EmptyState, LoadingSkeleton } from "@/components/ui/foundation";
import { useExpenseModal } from "@/store/expense-modal-store";

type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  note: string | null;
  spentAt: Date | string;
};

type Filters = {
  search?: string;
  category?: string;
  date?: string;
  sort?: string;
};

const categoryConfig = {
  FOOD: { label: "Food", icon: Utensils },
  TRAVEL: { label: "Travel", icon: Car },
  SHOPPING: { label: "Shopping", icon: ShoppingBag },
  SUBSCRIPTION: { label: "Subscription", icon: CreditCard },
  OTHER: { label: "Other", icon: ReceiptText },
};

function formatExpenseDate(date: Date | string) {
  const expenseDate = new Date(date);

  if (isToday(expenseDate)) {
    return `Today, ${format(expenseDate, "h:mm a")}`;
  }

  return format(expenseDate, "dd MMM yyyy, h:mm a");
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export default function ExpensesList({
  initialExpenses,
  initialCursor,
  filters,
}: {
  initialExpenses: Expense[];
  initialCursor: string | null;
  filters: Filters;
}) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { onEditOpen } = useExpenseModal();
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setExpenses(initialExpenses);
    setCursor(initialCursor);
  }, [initialExpenses, initialCursor]);

  async function loadMore() {
    if (!cursor || loading) return;

    setLoading(true);
    const res = await getExpenses({ cursor, ...filters });
    setExpenses((previous) => [...previous, ...res.expenses]);
    setCursor(res.nextCursor);
    setLoading(false);
  }

  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [cursor, loading, filters]);

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    const previousExpenses = expenses;
    setDeletingId(id);
    setExpenses((previous) => previous.filter((expense) => expense.id !== id));

    const res = await deleteExpense(id);

    if (!res.ok) {
      setExpenses(previousExpenses);
      alert(res.error || "Failed to delete expense");
    }

    setDeletingId(null);
    router.refresh();
  }

  function handleEdit(expense: Expense) {
    setOpenMenuId(null);
    onEditOpen({ ...expense, spentAt: new Date(expense.spentAt) });
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No expenses found"
        description="Add your first expense or clear the current filters to see your spending history."
        className="border-0 py-8 sm:py-10"
      />
    );
  }

  return (
    <div>
      <div className="divide-y divide-border/60 px-4 sm:px-5">
        {expenses.map((expense) => {
          const config =
            categoryConfig[expense.category as keyof typeof categoryConfig] ||
            categoryConfig.OTHER;
          const Icon = config.icon;
          const isMenuOpen = openMenuId === expense.id;
          const isDeleting = deletingId === expense.id;

          return (
            <article
              key={expense.id}
              className="flex min-w-0 items-start justify-between gap-3 py-3 sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center sm:gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-blue-400">
                  <Icon className="size-3.5" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="min-w-0 truncate text-sm font-medium text-foreground">
                      {expense.name}
                    </h3>
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {config.label}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatExpenseDate(expense.spentAt)}
                  </p>

                  {expense.note ? (
                    <p className="mt-1 line-clamp-1 max-w-2xl text-xs leading-5 text-muted-foreground/80">
                      {expense.note}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                <p className="text-right text-sm font-semibold text-foreground tabular-nums sm:min-w-24 sm:text-base">
                  {formatCurrency(Number(expense.amount))}
                </p>

                <ExpenseMenu
                  expense={expense}
                  isMenuOpen={isMenuOpen}
                  isDeleting={isDeleting}
                  setOpenMenuId={setOpenMenuId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div ref={loaderRef} className="border-t border-border/60 px-4 py-2 sm:px-5">
        {loading ? (
          <ExpenseScrollSkeleton />
        ) : cursor ? (
          <p className="text-center text-[11px] text-muted-foreground">
            Scroll to load more
          </p>
        ) : (
          <p className="text-center text-[11px] text-muted-foreground">
            End of expense history
          </p>
        )}
      </div>
    </div>
  );
}

function ExpenseMenu({
  expense,
  isMenuOpen,
  isDeleting,
  setOpenMenuId,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  isMenuOpen: boolean;
  isDeleting: boolean;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative">
      {isMenuOpen ? (
        <button
          type="button"
          aria-label="Close expense actions"
          onClick={() => setOpenMenuId(null)}
          className="fixed inset-0 z-40 cursor-default bg-transparent"
        />
      ) : null}

      <button
        type="button"
        aria-label={`Open actions for ${expense.name}`}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        onClick={() => setOpenMenuId(isMenuOpen ? null : expense.id)}
        className="relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <MoreVertical className="size-4" />
      </button>

      {isMenuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/25"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => onEdit(expense)}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={isDeleting}
            onClick={() => onDelete(expense.id)}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="size-3.5" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ExpenseScrollSkeleton() {
  return (
    <div className="space-y-2 py-1">
      {[1, 2].map((item) => (
        <div key={item} className="flex items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <LoadingSkeleton className="size-8 shrink-0 rounded-lg" />
            <div>
              <LoadingSkeleton className="h-4 w-36" />
              <LoadingSkeleton className="mt-1.5 h-3 w-24" />
            </div>
          </div>
          <LoadingSkeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
