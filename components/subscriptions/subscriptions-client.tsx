"use client";

import { StyledSelect } from "@/components/ui/select";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  Edit,
  IndianRupee,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import { deleteSubscription } from "@/actions/subscription/delete-subscription";
import { getSubscriptions } from "@/actions/subscription/get-subscriptions";
import { updateSubscriptionStatus } from "@/actions/subscription/update-subscription-status";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { useConfirmation } from "@/components/ui/confirmation-dialog";
import {
  EmptyState,
  FilterBar,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/ui/foundation";
import { ResponsiveFilterControls } from "@/components/ui/responsive-filter-controls";
import { useSubscriptionModal } from "@/store/subscription-modal-store";

import { AddSubscriptionModal } from "./add-subscription-modal";
import { EditSubscriptionModal } from "./edit-subscription-modal";

type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextRenewalDate: string;
  isActive: boolean;
  category: string;
  planName: string | null;
  logo: string | null;
};

type BillingCycle = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";

type SubscriptionPlan = {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
};

type SubscriptionTemplate = {
  id: string;
  name: string;
  logo: string | null;
  category: string;
  plans: SubscriptionPlan[];
};

type UserStats = {
  monthlyTotal: number;
  yearlyEstimate: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  upcomingRenewal: {
    name: string;
    date: string;
  } | null;
};

type Filters = {
  search: string;
  status: string;
  type: string;
};

type Props = {
  initialSubscriptions: Subscription[];
  initialCursor: string | null;
  userStats: UserStats;
  filters: Filters;
  templates: SubscriptionTemplate[];
};

const subscriptionTypes = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Custom", value: "CUSTOM" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getRenewalDays(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewalDate = new Date(date);
  renewalDate.setHours(0, 0, 0, 0);
  return Math.ceil(
    (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getDaysLeft(date: string) {
  const days = getRenewalDays(date);

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Renews today";
  if (days === 1) return "Renews tomorrow";
  return `Renews in ${days} days`;
}

function getRenewalTone(date: string) {
  const days = getRenewalDays(date);
  if (days < 0) return "danger";
  if (days <= 7) return "warning";
  return "neutral";
}

function formatBillingCycle(cycle: string) {
  if (cycle === "MONTHLY") return "Monthly";
  if (cycle === "QUARTERLY") return "Quarterly";
  if (cycle === "HALF_YEARLY") return "Half-yearly";
  if (cycle === "YEARLY") return "Yearly";
  return cycle;
}

export function SubscriptionsClient({
  initialSubscriptions,
  initialCursor,
  userStats,
  filters,
  templates,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [cursor, setCursor] = useState(initialCursor);
  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "ALL");
  const [type, setType] = useState(filters.type || "ALL");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { onOpen, onEditOpen } = useSubscriptionModal();
  const { confirm } = useConfirmation();

  const hasFilters =
    filters.search || filters.status !== "ALL" || filters.type !== "ALL";

  useEffect(() => {
    setSubscriptions(initialSubscriptions);
    setCursor(initialCursor);
  }, [initialSubscriptions, initialCursor]);

  useEffect(() => {
    setSearch(filters.search || "");
    setStatus(filters.status || "ALL");
    setType(filters.type || "ALL");
  }, [filters.search, filters.status, filters.type]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "ALL" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setType("ALL");
    startTransition(() => router.replace(pathname));
  }

  useEffect(() => {
    if (search === (filters.search || "")) return;

    const timeout = setTimeout(() => updateParam("search", search), 500);
    return () => clearTimeout(timeout);
  }, [search, filters.search]);

  async function loadMoreSubscriptions() {
    if (!cursor || isLoadingMore || isPending) return;

    setIsLoadingMore(true);
    try {
      const res = await getSubscriptions({
        cursor,
        search: filters.search,
        status: filters.status,
        type: filters.type,
      });
      setSubscriptions((previous) => [...previous, ...res.subscriptions]);
      setCursor(res.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !cursor || isPending) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreSubscriptions();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [
    cursor,
    isLoadingMore,
    isPending,
    filters.search,
    filters.status,
    filters.type,
  ]);

  async function handleStatusChange(subscription: Subscription) {
    const nextStatus = !subscription.isActive;
    const previousSubscriptions = subscriptions;

    setSubscriptions((previous) =>
      previous.map((item) =>
        item.id === subscription.id ? { ...item, isActive: nextStatus } : item
      )
    );

    const res = await updateSubscriptionStatus(subscription.id, nextStatus);

    if (!res.ok) {
      setSubscriptions(previousSubscriptions);
      alert(res.error || "Failed to update subscription status");
      return;
    }

    router.refresh();
  }

  async function handleDelete(id: string) {
    const subscription = subscriptions.find((item) => item.id === id);
    const confirmed = await confirm({
      title: "Delete subscription?",
      description: subscription
        ? `This permanently removes "${subscription.name}" and its renewal tracking.`
        : "This permanently removes the subscription and its renewal tracking.",
      confirmLabel: "Delete subscription",
      tone: "danger",
    });
    if (!confirmed) return;

    const previousSubscriptions = subscriptions;
    setSubscriptions((previous) =>
      previous.filter((subscription) => subscription.id !== id)
    );

    const res = await deleteSubscription(id);

    if (!res.ok) {
      setSubscriptions(previousSubscriptions);
      alert(res.error || "Failed to delete subscription");
      return;
    }

    router.refresh();
  }

  const summaryItems = [
    {
      label: "Monthly total",
      value: formatCurrency(userStats.monthlyTotal || 0),
      supportingText: "Active subscription cost",
      icon: Wallet,
    },
    {
      label: "Active subscriptions",
      value: String(userStats.activeSubscriptions || 0),
      supportingText: `${userStats.totalSubscriptions || 0} total saved`,
      icon: CreditCard,
    },
    {
      label: "Upcoming renewal",
      value: userStats.upcomingRenewal?.name || "None",
      supportingText: userStats.upcomingRenewal
        ? getDaysLeft(userStats.upcomingRenewal.date)
        : "No upcoming renewals",
      icon: CalendarDays,
    },
    {
      label: "Yearly estimate",
      value: formatCurrency(userStats.yearlyEstimate || 0),
      supportingText: "Estimated yearly cost",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-4 text-foreground">
      <AddSubscriptionModal templates={templates} />
      <EditSubscriptionModal />

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Plan overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track recurring plans and renewal dates.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-green-500"
        >
          <Plus className="size-4" />
          Add subscription
        </button>
      </section>

      <FinancialSummary items={summaryItems} />

      <FilterBar className="p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.5fr)_minmax(150px,1fr)_minmax(150px,1fr)_auto]">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
              aria-hidden="true"
            />
            <input
              aria-label="Search subscriptions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subscriptions..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/70"
            />
          </div>

          <ResponsiveFilterControls
            hasActiveFilters={status !== "ALL" || type !== "ALL"}
          >
            <StyledSelect
              aria-label="Filter by status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                updateParam("status", event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/70"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </StyledSelect>

            <StyledSelect
              aria-label="Filter by billing type"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                updateParam("type", event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/70"
            >
              <option value="ALL">All types</option>
              {subscriptionTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </StyledSelect>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-muted px-4 text-sm text-foreground hover:bg-accent"
              >
                <X className="size-3.5" aria-hidden="true" />
                Clear
              </button>
            ) : null}
          </ResponsiveFilterControls>
        </div>
      </FilterBar>

      <section
        aria-labelledby="subscription-list-title"
        className="rounded-xl border border-border/70 bg-card"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5">
          <div>
            <h2
              id="subscription-list-title"
              className="text-sm font-semibold text-foreground"
            >
              Subscriptions
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Plans, costs and upcoming renewals
            </p>
          </div>
        </div>

        {isPending ? (
          <SubscriptionRowsSkeleton />
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No subscriptions found"
            description="Add a plan or clear the current filters to see your subscriptions."
            action={
              <button
                type="button"
                onClick={onOpen}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-green-500"
              >
                <Plus className="size-4" />
                Add subscription
              </button>
            }
            className="border-0 py-8 sm:py-10"
          />
        ) : (
          <>
            <div className="divide-y divide-border/60 px-3 sm:px-5">
              {subscriptions.map((subscription) => (
                <SubscriptionRow
                  key={subscription.id}
                  subscription={subscription}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
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
                <SubscriptionRowsSkeleton compact />
              ) : cursor ? (
                <p className="text-center text-[11px] text-muted-foreground">
                  Scroll to load more
                </p>
              ) : (
                <p className="text-center text-[11px] text-muted-foreground">
                  End of subscriptions
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

type SubscriptionRowProps = {
  subscription: Subscription;
  openMenuId: string | null;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  onStatusChange: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onEdit: (subscription: Subscription) => void;
};

function SubscriptionRow({
  subscription,
  openMenuId,
  setOpenMenuId,
  onStatusChange,
  onDelete,
  onEdit,
}: SubscriptionRowProps) {
  const isMenuOpen = openMenuId === subscription.id;
  const renewalTone = subscription.isActive
    ? getRenewalTone(subscription.nextRenewalDate)
    : "neutral";

  return (
    <article className="relative grid min-w-0 gap-1.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3 sm:py-3 lg:grid-cols-[minmax(0,1fr)_minmax(160px,auto)_auto]">
      <div className="flex min-w-0 items-start gap-2.5 pr-8 sm:items-center sm:gap-3 sm:pr-0">
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/90 ring-1 ring-black/10 sm:size-9">
          {subscription.logo ? (
            <img
              src={subscription.logo}
              alt=""
              loading="lazy"
              className="size-5 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] sm:size-6"
            />
          ) : (
            <CreditCard className="size-3.5 text-slate-700 sm:size-4" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 sm:gap-y-1">
            <h3 className="truncate text-[13px] font-medium text-foreground sm:text-sm">
              {subscription.name}
            </h3>
            <StatusBadge
              tone={subscription.isActive ? "success" : "neutral"}
              className="px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs"
            >
              {subscription.isActive ? "Active" : "Inactive"}
            </StatusBadge>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
            {subscription.planName || "Standard plan"}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px] text-muted-foreground/80 sm:mt-1 sm:gap-x-2 sm:text-[11px]">
            <span className="rounded-full bg-muted px-1.5 py-0.5 sm:px-2">
              {subscription.category}
            </span>
            <span>{formatBillingCycle(subscription.billingCycle)}</span>
          </div>
        </div>
      </div>

      <div className="ml-10 flex min-w-0 items-center justify-between gap-3 sm:col-start-1 sm:row-start-2 sm:ml-0 sm:block lg:col-start-2 lg:row-start-1 lg:text-right">
        <p className="shrink-0 text-[11px] text-muted-foreground sm:text-xs">
          {formatDate(subscription.nextRenewalDate)}
        </p>
        <p
          className={`text-right text-[10px] font-medium sm:mt-0.5 sm:text-left sm:text-[11px] lg:text-right ${
            renewalTone === "danger"
              ? "text-red-400"
              : renewalTone === "warning"
                ? "text-amber-300"
                : "text-muted-foreground"
          }`}
        >
          {getDaysLeft(subscription.nextRenewalDate)}
        </p>
      </div>

      <div className="contents sm:col-start-2 sm:row-start-1 sm:flex sm:items-center sm:justify-end sm:gap-2 lg:col-start-3">
        <div className="ml-10 flex items-baseline gap-1.5 text-left sm:ml-0 sm:min-w-28 sm:block sm:text-right">
          <p className="text-[13px] font-semibold text-foreground tabular-nums sm:text-sm">
            {formatCurrency(subscription.amount)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            / {formatBillingCycle(subscription.billingCycle)}
          </p>
        </div>

        <div className="absolute right-0 top-2 sm:static">
          <SubscriptionMenu
            subscription={subscription}
            isMenuOpen={isMenuOpen}
            setOpenMenuId={setOpenMenuId}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </article>
  );
}

function SubscriptionMenu({
  subscription,
  isMenuOpen,
  setOpenMenuId,
  onStatusChange,
  onDelete,
  onEdit,
}: {
  subscription: Subscription;
  isMenuOpen: boolean;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  onStatusChange: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onEdit: (subscription: Subscription) => void;
}) {
  return (
    <div className="relative">
      {isMenuOpen ? (
        <button
          type="button"
          aria-label="Close subscription actions"
          onClick={() => setOpenMenuId(null)}
          className="fixed inset-0 z-40 cursor-default bg-transparent"
        />
      ) : null}

      <button
        type="button"
        aria-label={`Open actions for ${subscription.name}`}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        onClick={() => setOpenMenuId(isMenuOpen ? null : subscription.id)}
        className="relative inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:size-8"
      >
        <MoreVertical className="size-3.5 sm:size-4" aria-hidden="true" />
      </button>

      {isMenuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/25 sm:top-9"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpenMenuId(null);
              onEdit(subscription);
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
              onStatusChange(subscription);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground hover:bg-accent"
          >
            <CreditCard className="size-3.5" />
            {subscription.isActive ? "Mark inactive" : "Mark active"}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpenMenuId(null);
              onDelete(subscription.id);
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

function SubscriptionRowsSkeleton({ compact = false }: { compact?: boolean }) {
  const rows = compact ? 2 : 6;

  return (
    <div className="divide-y divide-border/60 px-3 sm:px-5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <LoadingSkeleton className="size-9 shrink-0 rounded-lg" />
            <div>
              <LoadingSkeleton className="h-4 w-36" />
              <LoadingSkeleton className="mt-1.5 h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LoadingSkeleton className="hidden h-3 w-28 lg:block" />
            <LoadingSkeleton className="h-4 w-20" />
            <LoadingSkeleton className="size-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
