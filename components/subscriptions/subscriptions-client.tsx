"use client";

import { getSubscriptions } from "@/actions/subscription/get-subscriptions";
import { deleteSubscription } from "@/actions/subscription/delete-subscription";
import { updateSubscriptionStatus } from "@/actions/subscription/update-subscription-status";
import { useSubscriptionModal } from "@/store/subscription-modal-store";

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
  Zap,
} from "lucide-react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ElementType,
} from "react";

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

function getDaysLeft(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewalDate = new Date(date);
  renewalDate.setHours(0, 0, 0, 0);

  const diff = renewalDate.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Renews today";
  if (days === 1) return "Renews tomorrow";

  return `Renews in ${days} days`;
}

function formatBillingCycle(cycle: string) {
  if (cycle === "MONTHLY") return "Monthly";
  if (cycle === "QUARTERLY") return "Quarterly";
  if (cycle === "HALF_YEARLY") return "Half-Yearly";
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

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setType("ALL");

    startTransition(() => {
      router.replace(pathname);
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

    setSubscriptions((prev) =>
      prev.map((item) =>
        item.id === subscription.id
          ? {
              ...item,
              isActive: nextStatus,
            }
          : item
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
    const confirmed = confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) return;

    const previousSubscriptions = subscriptions;

    setSubscriptions((prev) =>
      prev.filter((subscription) => subscription.id !== id)
    );

    const res = await deleteSubscription(id);

    if (!res.ok) {
      setSubscriptions(previousSubscriptions);
      alert(res.error || "Failed to delete subscription");
      return;
    }

    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#010409] px-4 py-5 text-white sm:px-6 lg:px-8">
      <AddSubscriptionModal templates={templates} />
      <EditSubscriptionModal />

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
          >
            <Plus size={17} />
            Add Subscription
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between md:hidden">
            <p className="text-xs text-[#8B949E]">Overview</p>

            <div className="flex items-center gap-2 text-xs text-[#6E7681]">
              <span>Swipe to see more</span>
            </div>
          </div>

          <div className="relative">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
              <StatCard
                title="Monthly Total"
                value={formatCurrency(userStats.monthlyTotal || 0)}
                subtitle="Active subscription cost"
                icon={Wallet}
              />

              <StatCard
                title="Active Subscriptions"
                value={`${userStats.activeSubscriptions || 0}`}
                subtitle={`${userStats.totalSubscriptions || 0} total saved`}
                icon={CreditCard}
              />

              <StatCard
                title="Upcoming Renewal"
                value={userStats.upcomingRenewal?.name || "None"}
                subtitle={
                  userStats.upcomingRenewal
                    ? getDaysLeft(userStats.upcomingRenewal.date)
                    : "No upcoming renewals"
                }
                icon={CalendarDays}
              />

              <StatCard
                title="Yearly Estimate"
                value={formatCurrency(userStats.yearlyEstimate || 0)}
                subtitle="Estimated yearly cost"
                icon={IndianRupee}
              />
            </div>

            <div className="pointer-events-none absolute bottom-3 right-0 top-0 w-12 bg-linear-to-l from-[#010409] to-transparent md:hidden" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subscriptions..."
                className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                updateParam("status", event.target.value);
              }}
              className="h-11 cursor-pointer rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                updateParam("type", event.target.value);
              }}
              className="h-11 cursor-pointer rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF]"
            >
              <option value="ALL">All Types</option>
              {subscriptionTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm text-[#C9D1D9] transition hover:bg-[#21262D]"
              >
                <X size={16} />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {isPending ? (
          <SubscriptionBottomSkeleton />
        ) : subscriptions.length === 0 ? (
          <EmptyState onOpen={onOpen} />
        ) : (
          <div className="space-y-3">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onEdit={onEditOpen}
              />
            ))}

            <div ref={loadMoreRef} className="h-8" />

            {isLoadingMore ? <SubscriptionBottomSkeleton /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ElementType;
}) {
  return (
    <div className="min-w-57.5 snap-start rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#8B949E]">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
          <p className="mt-1 text-xs text-[#6E7681]">{subtitle}</p>
        </div>

        <div className="rounded-xl border border-[#3D444D] bg-[#151B23] p-2 text-[#58A6FF]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

type SubscriptionCardProps = {
  subscription: Subscription;
  openMenuId: string | null;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  onStatusChange: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onEdit: (subscription: Subscription) => void;
};

function SubscriptionCard({
  subscription,
  openMenuId,
  setOpenMenuId,
  onStatusChange,
  onDelete,
  onEdit,
}: SubscriptionCardProps) {
  const isMenuOpen = openMenuId === subscription.id;

  return (
    <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 transition hover:border-[#58A6FF]/40">
      <div className="hidden items-start justify-between gap-4 md:flex">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#3D444D] bg-[#151B23]">
            {subscription.logo ? (
              <img
                src={subscription.logo}
                alt={subscription.name}
                loading="lazy"
                className="h-7 w-7 object-contain"
              />
            ) : (
              <CreditCard size={22} className="text-[#8B949E]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-white">
                {subscription.name}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  subscription.isActive
                    ? "bg-[#238636]/15 text-[#3FB950]"
                    : "bg-[#6E7681]/15 text-[#8B949E]"
                }`}
              >
                {subscription.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#8B949E]">
              <span>{subscription.category}</span>
              {subscription.planName ? <span>{subscription.planName}</span> : null}
              <span>{formatBillingCycle(subscription.billingCycle)}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#151B23] px-3 py-1 text-[#C9D1D9]">
                <Zap size={14} />
                {formatCurrency(subscription.amount)} /{" "}
                {formatBillingCycle(subscription.billingCycle)}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#151B23] px-3 py-1 text-[#C9D1D9]">
                <CalendarDays size={14} />
                Next: {formatDate(subscription.nextRenewalDate)}
              </span>

              <span className="rounded-full bg-[#151B23] px-3 py-1 text-[#58A6FF]">
                {getDaysLeft(subscription.nextRenewalDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onStatusChange(subscription)}
            className={`inline-flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition ${
              subscription.isActive
                ? "border-[#238636]/40 bg-[#238636]/10 text-[#3FB950] hover:bg-[#238636]/15"
                : "border-[#3D444D] bg-[#151B23] text-[#8B949E] hover:bg-[#21262D]"
            }`}
          >
            {subscription.isActive ? "Active" : "Inactive"}
          </button>

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

      <div className="md:hidden">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3D444D] bg-[#151B23]">
            {subscription.logo ? (
              <img
                src={subscription.logo}
                alt={subscription.name}
                loading="lazy"
                className="h-7 w-7 object-contain"
              />
            ) : (
              <CreditCard size={20} className="text-[#8B949E]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold leading-5 text-white">
                  {subscription.name}
                </h3>

                <p className="mt-1 truncate text-sm text-[#8B949E]">
                  {subscription.category}
                  {subscription.planName ? ` • ${subscription.planName}` : ""}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  subscription.isActive
                    ? "bg-[#238636]/15 text-[#3FB950]"
                    : "bg-[#6E7681]/15 text-[#8B949E]"
                }`}
              >
                {subscription.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl bg-[#151B23] px-3 py-3">
                <p className="text-xs text-[#8B949E]">Cost</p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(subscription.amount)}
                  <span className="font-normal text-[#8B949E]">
                    {" "}
                    / {formatBillingCycle(subscription.billingCycle)}
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-[#151B23] px-3 py-3">
                <p className="text-xs text-[#8B949E]">Next renewal</p>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold text-white">
                    {formatDate(subscription.nextRenewalDate)}
                  </p>

                  <span className="text-xs text-[#3D444D]">•</span>

                  <p className="text-xs font-medium text-[#58A6FF]">
                    {getDaysLeft(subscription.nextRenewalDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onStatusChange(subscription)}
                className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                  subscription.isActive
                    ? "border-[#238636]/40 bg-[#238636]/10 text-[#3FB950] hover:bg-[#238636]/15"
                    : "border-[#3D444D] bg-[#151B23] text-[#8B949E] hover:bg-[#21262D]"
                }`}
              >
                {subscription.isActive ? "Active" : "Inactive"}
              </button>

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
        </div>
      </div>
    </div>
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
          aria-label="Close subscription menu"
          onClick={() => setOpenMenuId(null)}
          className="fixed inset-0 z-40 cursor-default bg-transparent"
        />
      ) : null}

      <button
        type="button"
        onClick={() => {
          setOpenMenuId(isMenuOpen ? null : subscription.id);
        }}
        className="relative z-50 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#C9D1D9] transition hover:bg-[#21262D]"
      >
        <MoreVertical size={17} />
      </button>

      {isMenuOpen ? (
        <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-[#3D444D] bg-[#151B23] shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              onEdit(subscription);
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-[#C9D1D9] hover:bg-[#21262D]"
          >
            <Edit size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              onStatusChange(subscription);
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-[#C9D1D9] hover:bg-[#21262D]"
          >
            <CreditCard size={15} />
            {subscription.isActive ? "Mark inactive" : "Mark active"}
          </button>

          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              onDelete(subscription.id);
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionBottomSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#151B23]" />

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

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#3D444D] bg-[#0D1117] px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#151B23] text-[#58A6FF]">
        <CreditCard size={22} />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-white">
        No subscriptions found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-[#8B949E]">
        Add Netflix, Spotify, ChatGPT, Canva, hosting, or any paid plan you want
        to track.
      </p>

      <button
        type="button"
        onClick={onOpen}
        className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
      >
        <Plus size={17} />
        Add Subscription
      </button>
    </div>
  );
}