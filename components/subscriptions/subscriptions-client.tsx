"use client";

import { getSubscriptions } from "@/actions/subscription/get-subscriptions";
import { updateSubscriptionStatus } from "@/actions/subscription/update-subscription-status";
import { useSubscriptionModal } from "@/store/subscription-modal-store";
import {
  CalendarDays,
  CreditCard,
  Edit,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AddSubscriptionModal } from "./add-subscription-modal";
import { deleteSubscription } from "@/actions/subscription/delete-subscription";
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

export function SubscriptionsClient({
  initialSubscriptions,
  initialCursor,
  userStats,
  filters,
  templates
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [cursor, setCursor] = useState(initialCursor);

  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "ALL");
  const [type, setType] = useState(filters.type || "ALL");

  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFirstSearchRender = useRef(true);

  const { onOpen, onEditOpen } = useSubscriptionModal();

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

  useEffect(() => {
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      updateParam("search", search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

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

      setSubscriptions((prev) => [...prev, ...res.subscriptions]);
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
        if (entries[0].isIntersecting) {
          loadMoreSubscriptions();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [cursor, isLoadingMore, isPending, filters.search, filters.status, filters.type]);

  async function handleStatusChange(id: string, value: string) {
    const isActive = value === "ACTIVE";

    const previousSubscriptions = subscriptions;

    setSubscriptions((prev) =>
      prev.map((subscription) =>
        subscription.id === id ? { ...subscription, isActive } : subscription
      )
    );

    const res = await updateSubscriptionStatus(id, isActive);

    if (!res.ok) {
      setSubscriptions(previousSubscriptions);
      alert(res.error || "Failed to update subscription status");
      return;
    }

    router.refresh();
  }

  async function handleDelete(id: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) return;

    setSubscriptions((prev) =>
      prev.filter((subscription) => subscription.id !== id)
    );

    await deleteSubscription(id)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#010409] text-white">
      <AddSubscriptionModal templates={templates} />
      <EditSubscriptionModal />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <button
          type="button"
          onClick={onOpen}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-[#2f8132] bg-[#238636] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
        >
          <Plus size={16} />
          Add Subscription
        </button>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Monthly Total"
            value={`₹${Math.round(userStats.monthlyTotal).toLocaleString(
              "en-IN"
            )}`}
            description="Active subscriptions"
            icon={Wallet}
          />

          <SummaryCard
            title="Active Subscriptions"
            value={String(userStats.activeSubscriptions)}
            description={`${userStats.totalSubscriptions} total saved`}
            icon={CreditCard}
          />

          <SummaryCard
            title="Upcoming Renewal"
            value={userStats.upcomingRenewal?.name || "No upcoming"}
            description={
              userStats.upcomingRenewal
                ? formatDate(userStats.upcomingRenewal.date)
                : "Nothing active"
            }
            icon={CalendarDays}
          />

          <SummaryCard
            title="Yearly Estimate"
            value={`₹${Math.round(userStats.yearlyEstimate).toLocaleString(
              "en-IN"
            )}`}
            description="Approx yearly cost"
            icon={Zap}
          />
        </div>

        {/* Filters */}
        <section className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscriptions..."
                className="w-full rounded-lg border border-[#3D444D] bg-[#010409] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#58A6FF]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  updateParam("status", e.target.value);
                }}
                className="rounded-lg border border-[#3D444D] bg-[#010409] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58A6FF] cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  updateParam("type", e.target.value);
                }}
                className="rounded-lg border border-[#3D444D] bg-[#010409] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58A6FF] cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="CUSTOM">Custom</option>
              </select>

              {hasFilters && (
                <Link
                  href="/dashboard/subscriptions"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#3D444D] bg-[#151B23] px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <X size={16} />
                  Remove Filters
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* List */}
        {isPending ? (
          <SubscriptionListSkeleton />
        ) : (
          <div className="space-y-3">
            {subscriptions.length > 0 ? (
              subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onEdit={onEditOpen}
                />
              ))
            ) : (
              <EmptyState />
            )}

            <div ref={loadMoreRef} />

            {isLoadingMore && <SubscriptionBottomSkeleton />}
          </div>
        )}
      </div>
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
};

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-4 transition hover:border-[#4B5563] hover:bg-[#11161d]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#8B949E]">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{value}</h2>
          <p className="mt-1 text-xs text-[#6E7681]">{description}</p>
        </div>

        <div className="rounded-lg border border-[#3D444D] bg-[#151B23] p-2 text-[#58A6FF]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

type SubscriptionCardProps = {
  subscription: Subscription;
  onStatusChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onEdit: (subscription: Subscription) => void;
};

function SubscriptionCard({
  subscription,
  onStatusChange,
  onDelete,
  onEdit,
}: SubscriptionCardProps) {
  return (
    <div className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-4 transition hover:border-[#4B5563] hover:bg-[#11161d] cursor-pointer">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3D444D] bg-[#151B23]">
            {subscription.logo ? (
              <img
                src={subscription.logo}
                alt={subscription.name}
                className="h-7 w-7 object-contain"
              />
            ) : (
              <CreditCard size={22} className="text-[#8B949E]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-medium text-white">
                {subscription.name}
              </h3>

              <span className="rounded-full border border-[#3D444D] bg-[#151B23] px-2 py-0.5 text-xs text-[#8B949E]">
                {subscription.category}
              </span>
            </div>

            <p className="mt-1 text-sm text-[#8B949E]">
              {subscription.planName || "No plan selected"}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <p className="text-white">
                ₹{subscription.amount.toLocaleString("en-IN")}
                <span className="ml-1 text-[#8B949E]">
                  / {formatBillingCycle(subscription.billingCycle)}
                </span>
              </p>

              <p className="text-[#8B949E]">
                Next renewal:{" "}
                <span className="text-white">
                  {formatDate(subscription.nextRenewalDate)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <select
            value={subscription.isActive ? "ACTIVE" : "INACTIVE"}
            onChange={(e) => onStatusChange(subscription.id, e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none transition cursor-pointer ${subscription.isActive
              ? "border-[#2f8132] bg-[#0f2415] text-[#3fb950]"
              : "border-[#3D444D] bg-[#151B23] text-[#8B949E]"
              }`}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            type="button"
            onClick={() => onEdit(subscription)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#3D444D] bg-[#151B23] px-3 py-2 text-sm text-[#C9D1D9] transition hover:border-[#58A6FF] hover:text-white"
          >
            <Edit size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(subscription.id)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#3D444D] bg-[#151B23] px-3 py-2 text-sm text-[#F85149] transition hover:border-[#F85149]"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-4"
        >
          <div className="flex animate-pulse flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#151B23]" />

              <div className="space-y-3">
                <div className="h-4 w-40 rounded bg-[#151B23]" />
                <div className="h-3 w-28 rounded bg-[#151B23]" />
                <div className="flex flex-wrap gap-3">
                  <div className="h-3 w-24 rounded bg-[#151B23]" />
                  <div className="h-3 w-32 rounded bg-[#151B23]" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="h-9 w-24 rounded-lg bg-[#151B23]" />
              <div className="h-9 w-20 rounded-lg bg-[#151B23]" />
              <div className="h-9 w-20 rounded-lg bg-[#151B23]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubscriptionBottomSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-4"
        >
          <div className="flex animate-pulse items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#151B23]" />

            <div className="space-y-3">
              <div className="h-4 w-40 rounded bg-[#151B23]" />
              <div className="h-3 w-28 rounded bg-[#151B23]" />
              <div className="h-3 w-52 rounded bg-[#151B23]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {

  const { onOpen } = useSubscriptionModal();

  return (
    <div className="rounded-xl border border-dashed border-[#3D444D] bg-[#0D1117] p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
        <CreditCard size={22} />
      </div>

      <h3 className="mt-4 text-lg font-medium text-white">
        No subscriptions found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-[#8B949E]">
        Add your first subscription to track renewals, monthly cost, and avoid
        surprise payments.
      </p>

      <button
        type="button"
        onClick={onOpen}
        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-[#2f8132] bg-[#238636] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
      >
        <Plus size={16} />
        Add Subscription
      </button>
    </div>
  );
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatBillingCycle(cycle: string) {
  if (cycle === "MONTHLY") return "month";
  if (cycle === "QUARTERLY") return "quarter";
  if (cycle === "HALF_YEARLY") return "6 months";
  if (cycle === "YEARLY") return "year";

  return cycle.toLowerCase();
}