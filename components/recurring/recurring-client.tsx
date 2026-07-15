"use client";

import { StyledSelect } from "@/components/ui/select";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Edit,
  IndianRupee,
  MoreVertical,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import { deleteRecurring } from "@/actions/recurring/delete-recurring";
import {
  getRecurring,
  type RecurringExpenseItem,
  type RecurringStats,
} from "@/actions/recurring/get-recurring";
import { markRecurringPaid } from "@/actions/recurring/mark-recurring-paid";
import { updateRecurringStatus } from "@/actions/recurring/update-recurring-status";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import AddRecurringModal from "@/components/recurring/add-recurring-modal";
import EditRecurringModal from "@/components/recurring/edit-recurring-modal";
import {
  EmptyState,
  FilterBar,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/ui/foundation";
import { useRecurringModalStore } from "@/store/recurring-modal-store";

type Props = {
  initialStats: RecurringStats | null;
  initialRecurringExpenses: RecurringExpenseItem[];
  initialNextCursor: string | null;
  filters: {
    search?: string;
    status?: string;
    category?: string;
    cycle?: string;
    type?: string;
  };
};

const recurringCategories = [
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
  { label: "Half-yearly", value: "HALF_YEARLY" },
  { label: "Yearly", value: "YEARLY" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getDueDays(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  return Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getDaysLeft(date: string) {
  const days = getDueDays(date);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function getDueTone(date: string) {
  const days = getDueDays(date);
  if (days < 0) return "danger";
  if (days <= 7) return "warning";
  return "neutral";
}

function subtractBillingCycle(date: Date, billingCycle: string) {
  const previousDate = new Date(date);

  if (billingCycle === "MONTHLY") previousDate.setMonth(previousDate.getMonth() - 1);
  if (billingCycle === "QUARTERLY") previousDate.setMonth(previousDate.getMonth() - 3);
  if (billingCycle === "HALF_YEARLY") previousDate.setMonth(previousDate.getMonth() - 6);
  if (billingCycle === "YEARLY") previousDate.setFullYear(previousDate.getFullYear() - 1);

  previousDate.setHours(0, 0, 0, 0);
  return previousDate;
}

function getMarkPaidState(nextDueDate: string, billingCycle: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextDueDate);
  dueDate.setHours(0, 0, 0, 0);
  const cycleStartDate = subtractBillingCycle(dueDate, billingCycle);

  if (dueDate < today) {
    return { canMarkPaid: true, label: "Pay overdue", status: "OVERDUE" };
  }

  if (today >= cycleStartDate && today <= dueDate) {
    return { canMarkPaid: true, label: "Mark paid", status: "CURRENT_CYCLE" };
  }

  return { canMarkPaid: false, label: "Not due yet", status: "TOO_EARLY" };
}

function getCategoryLabel(category: string) {
  return (
    recurringCategories.find((item) => item.value === category)?.label || category
  );
}

function getCycleLabel(cycle: string) {
  return billingCycles.find((item) => item.value === cycle)?.label || cycle;
}

export default function RecurringClient({
  initialStats,
  initialRecurringExpenses,
  initialNextCursor,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [recurringExpenses, setRecurringExpenses] = useState(
    initialRecurringExpenses
  );
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isPending, startTransition] = useTransition();
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { onOpen, onEditOpen } = useRecurringModalStore();

  useEffect(() => {
    setRecurringExpenses(initialRecurringExpenses);
    setNextCursor(initialNextCursor);
  }, [initialRecurringExpenses, initialNextCursor]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function clearFilters() {
    setSearchValue("");
    startTransition(() => router.replace(pathname));
  }

  useEffect(() => {
    if (searchValue === (filters.search || "")) return;

    const timeout = setTimeout(() => updateParam("search", searchValue), 500);
    return () => clearTimeout(timeout);
  }, [searchValue, filters.search]);

  async function handleLoadMore() {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    const res = await getRecurring({
      search: filters.search,
      status: filters.status,
      category: filters.category,
      cycle: filters.cycle,
      type: filters.type,
      cursor: nextCursor,
    });

    if (res.ok) {
      setRecurringExpenses((previous) => [
        ...previous,
        ...res.recurringExpenses,
      ]);
      setNextCursor(res.nextCursor);
    }

    setIsLoadingMore(false);
  }

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [nextCursor, isLoadingMore, filters]);

  async function handleStatusChange(item: RecurringExpenseItem) {
    const previousRecurring = recurringExpenses;
    const nextStatus = !item.isActive;

    setRecurringExpenses((previous) =>
      previous.map((recurring) =>
        recurring.id === item.id
          ? { ...recurring, isActive: nextStatus }
          : recurring
      )
    );

    const res = await updateRecurringStatus({ id: item.id, isActive: nextStatus });

    if (!res.ok) {
      setRecurringExpenses(previousRecurring);
      alert(res.error);
    }
  }

  async function handleMarkPaid(item: RecurringExpenseItem) {
    const markPaidState = getMarkPaidState(item.nextDueDate, item.billingCycle);

    if (!markPaidState.canMarkPaid) {
      alert("You can mark this as paid only when its billing cycle starts.");
      return;
    }

    const confirmed = confirm(
      `Mark "${item.name}" as paid?\n\nThis will create an expense and move the next due date forward.`
    );
    if (!confirmed) return;

    setMarkingPaidId(item.id);
    const res = await markRecurringPaid({ id: item.id });
    setMarkingPaidId(null);

    if (!res.ok || !res.updatedRecurring) {
      alert(res.error);
      return;
    }

    setRecurringExpenses((previous) =>
      previous.map((recurring) =>
        recurring.id === item.id ? res.updatedRecurring! : recurring
      )
    );
    router.refresh();
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this recurring expense?"
    );
    if (!confirmDelete) return;

    const previousRecurring = recurringExpenses;
    setRecurringExpenses((previous) =>
      previous.filter((item) => item.id !== id)
    );

    const res = await deleteRecurring({ id });

    if (!res.ok) {
      setRecurringExpenses(previousRecurring);
      alert(res.error);
    }
  }

  const hasFilters =
    filters.search ||
    filters.status ||
    filters.category ||
    filters.cycle ||
    filters.type;

  const summaryItems = [
    {
      label: "Monthly recurring",
      value: formatCurrency(initialStats?.monthlyTotal || 0),
      supportingText: "Expected monthly cost",
      icon: Wallet,
    },
    {
      label: "Active recurring",
      value: String(initialStats?.activeRecurring || 0),
      supportingText: `${initialStats?.totalRecurring || 0} total recurring`,
      icon: RefreshCcw,
    },
    {
      label: "Upcoming due",
      value: initialStats?.upcomingDue?.name || "None",
      supportingText: initialStats?.upcomingDue
        ? getDaysLeft(initialStats.upcomingDue.date)
        : "No upcoming dues",
      icon: CalendarDays,
    },
    {
      label: "Yearly estimate",
      value: formatCurrency(initialStats?.yearlyEstimate || 0),
      supportingText: "Estimated yearly recurring cost",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-4 text-foreground">
      <AddRecurringModal />
      <EditRecurringModal />

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Recurring payment overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track repeating payments and upcoming due dates.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-green-500"
        >
          <Plus className="size-4" />
          Add recurring
        </button>
      </section>

      <FinancialSummary items={summaryItems} />

      <FilterBar className="p-3">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_repeat(4,minmax(125px,1fr))_auto]">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
              aria-hidden="true"
            />
            <input
              aria-label="Search recurring expenses"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search recurring expenses..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-blue-400"
            />
          </div>

          <StyledSelect
            aria-label="Filter by status"
            value={filters.status || ""}
            onChange={(event) => updateParam("status", event.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-400"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </StyledSelect>

          <StyledSelect
            aria-label="Filter by category"
            value={filters.category || ""}
            onChange={(event) => updateParam("category", event.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-400"
          >
            <option value="">All categories</option>
            {recurringCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </StyledSelect>

          <StyledSelect
            aria-label="Filter by billing cycle"
            value={filters.cycle || ""}
            onChange={(event) => updateParam("cycle", event.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-400"
          >
            <option value="">All cycles</option>
            {billingCycles.map((cycle) => (
              <option key={cycle.value} value={cycle.value}>
                {cycle.label}
              </option>
            ))}
          </StyledSelect>

          <StyledSelect
            aria-label="Filter by due date"
            value={filters.type || ""}
            onChange={(event) => updateParam("type", event.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-400"
          >
            <option value="">All due dates</option>
            <option value="DUE_SOON">Due soon</option>
            <option value="OVERDUE">Overdue</option>
          </StyledSelect>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-muted px-4 text-sm text-foreground hover:bg-accent"
            >
              <X className="size-3.5" />
              Clear
            </button>
          ) : null}
        </div>
      </FilterBar>

      <section
        aria-labelledby="recurring-list-title"
        className="rounded-xl border border-border/70 bg-card"
      >
        <div className="border-b border-border/60 px-4 py-3 sm:px-5">
          <h2
            id="recurring-list-title"
            className="text-sm font-semibold text-foreground"
          >
            Recurring payments
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Amounts, cycles and due dates
          </p>
        </div>

        {isPending ? (
          <RecurringRowsSkeleton />
        ) : recurringExpenses.length === 0 ? (
          <EmptyState
            icon={RefreshCcw}
            title="No recurring expenses found"
            description="Add a repeating payment or clear the current filters."
            action={
              <button
                type="button"
                onClick={onOpen}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-green-500"
              >
                <Plus className="size-4" />
                Add recurring expense
              </button>
            }
            className="border-0 py-8 sm:py-10"
          />
        ) : (
          <>
            <div className="divide-y divide-border/60 px-4 sm:px-5">
              {recurringExpenses.map((item) => (
                <RecurringRow
                  key={item.id}
                  item={item}
                  isMenuOpen={openMenuId === item.id}
                  isMarkingPaid={markingPaidId === item.id}
                  setOpenMenuId={setOpenMenuId}
                  onMarkPaid={handleMarkPaid}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onEdit={onEditOpen}
                />
              ))}
            </div>

            <div
              ref={loadMoreRef}
              className="border-t border-border/60 px-4 py-2 sm:px-5"
            >
              {isLoadingMore ? (
                <RecurringRowsSkeleton compact />
              ) : nextCursor ? (
                <p className="text-center text-[11px] text-muted-foreground">
                  Scroll to load more
                </p>
              ) : (
                <p className="text-center text-[11px] text-muted-foreground">
                  End of recurring payments
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function RecurringRow({
  item,
  isMenuOpen,
  isMarkingPaid,
  setOpenMenuId,
  onMarkPaid,
  onStatusChange,
  onDelete,
  onEdit,
}: {
  item: RecurringExpenseItem;
  isMenuOpen: boolean;
  isMarkingPaid: boolean;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  onMarkPaid: (item: RecurringExpenseItem) => void;
  onStatusChange: (item: RecurringExpenseItem) => void;
  onDelete: (id: string) => void;
  onEdit: (item: RecurringExpenseItem) => void;
}) {
  const markPaidState = getMarkPaidState(item.nextDueDate, item.billingCycle);
  const dueTone = item.isActive ? getDueTone(item.nextDueDate) : "neutral";

  return (
    <article className="grid min-w-0 gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[minmax(0,1fr)_minmax(150px,auto)_auto]">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate text-sm font-medium text-foreground">
            {item.name}
          </h3>
          <StatusBadge tone={item.isActive ? "success" : "neutral"}>
            {item.isActive ? "Active" : "Inactive"}
          </StatusBadge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground/80">
          <span className="rounded-full bg-muted px-2 py-0.5">
            {getCategoryLabel(item.category)}
          </span>
          <span>{getCycleLabel(item.billingCycle)}</span>
        </div>
        {item.note ? (
          <p className="mt-1 line-clamp-1 max-w-2xl text-xs text-muted-foreground/80">
            {item.note}
          </p>
        ) : null}
      </div>

      <div className="min-w-0 lg:text-right">
        <p className="text-xs text-muted-foreground">
          {formatDate(item.nextDueDate)}
        </p>
        <p
          className={`mt-0.5 text-[11px] font-medium ${
            dueTone === "danger"
              ? "text-red-400"
              : dueTone === "warning"
                ? "text-amber-300"
                : "text-muted-foreground"
          }`}
        >
          {getDaysLeft(item.nextDueDate)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:col-start-2 sm:row-start-1 sm:justify-end lg:col-start-3">
        <div className="text-left sm:min-w-24 sm:text-right">
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {formatCurrency(item.amount)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            / {getCycleLabel(item.billingCycle)}
          </p>
        </div>

        <button
          type="button"
          disabled={!markPaidState.canMarkPaid || isMarkingPaid}
          onClick={() => onMarkPaid(item)}
          className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium ${
            markPaidState.status === "OVERDUE"
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/15"
              : markPaidState.canMarkPaid
                ? "bg-muted text-foreground hover:bg-accent"
                : "cursor-not-allowed bg-muted/60 text-muted-foreground/60"
          }`}
          title={
            markPaidState.canMarkPaid
              ? "Mark this recurring expense as paid"
              : "Available when the billing cycle starts"
          }
        >
          {isMarkingPaid ? (
            <RefreshCcw className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          {isMarkingPaid ? "Marking..." : markPaidState.label}
        </button>

        <RecurringMenu
          item={item}
          isMenuOpen={isMenuOpen}
          setOpenMenuId={setOpenMenuId}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    </article>
  );
}

function RecurringMenu({
  item,
  isMenuOpen,
  setOpenMenuId,
  onStatusChange,
  onDelete,
  onEdit,
}: {
  item: RecurringExpenseItem;
  isMenuOpen: boolean;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  onStatusChange: (item: RecurringExpenseItem) => void;
  onDelete: (id: string) => void;
  onEdit: (item: RecurringExpenseItem) => void;
}) {
  return (
    <div className="relative">
      {isMenuOpen ? (
        <button
          type="button"
          aria-label="Close recurring expense actions"
          onClick={() => setOpenMenuId(null)}
          className="fixed inset-0 z-40 cursor-default bg-transparent"
        />
      ) : null}

      <button
        type="button"
        aria-label={`Open actions for ${item.name}`}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        onClick={() => setOpenMenuId(isMenuOpen ? null : item.id)}
        className="relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <MoreVertical className="size-4" />
      </button>

      {isMenuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/25"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpenMenuId(null);
              onEdit(item);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent"
          >
            <Edit className="size-3.5" />
            Edit
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpenMenuId(null);
              onStatusChange(item);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent"
          >
            <RefreshCcw className="size-3.5" />
            {item.isActive ? "Mark inactive" : "Mark active"}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpenMenuId(null);
              onDelete(item.id);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function RecurringRowsSkeleton({ compact = false }: { compact?: boolean }) {
  const rows = compact ? 2 : 6;

  return (
    <div className="divide-y divide-border/60 px-4 sm:px-5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-3 py-3">
          <div>
            <LoadingSkeleton className="h-4 w-40" />
            <LoadingSkeleton className="mt-1.5 h-3 w-28" />
          </div>
          <div className="flex items-center gap-3">
            <LoadingSkeleton className="hidden h-3 w-28 lg:block" />
            <LoadingSkeleton className="h-4 w-20" />
            <LoadingSkeleton className="h-8 w-24 rounded-lg" />
            <LoadingSkeleton className="size-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
