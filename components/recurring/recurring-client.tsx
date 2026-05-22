"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    CalendarDays,
    CheckCircle2,
    Clock,
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

import {
    getRecurring,
    type RecurringExpenseItem,
    type RecurringStats,
} from "@/actions/recurring/get-recurring";
import { deleteRecurring } from "@/actions/recurring/delete-recurring";
import { updateRecurringStatus } from "@/actions/recurring/update-recurring-status";
import AddRecurringModal from "@/components/recurring/add-recurring-modal";
import EditRecurringModal from "@/components/recurring/edit-recurring-modal";
import { useRecurringModalStore } from "@/store/recurring-modal-store";
import { markRecurringPaid } from "@/actions/recurring/mark-recurring-paid";

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
    { label: "Half-Yearly", value: "HALF_YEARLY" },
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

function getDaysLeft(date: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    const diff = dueDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";

    return `Due in ${days} days`;
}

function subtractBillingCycle(date: Date, billingCycle: string) {
    const previousDate = new Date(date);

    if (billingCycle === "MONTHLY") {
        previousDate.setMonth(previousDate.getMonth() - 1);
    }

    if (billingCycle === "QUARTERLY") {
        previousDate.setMonth(previousDate.getMonth() - 3);
    }

    if (billingCycle === "HALF_YEARLY") {
        previousDate.setMonth(previousDate.getMonth() - 6);
    }

    if (billingCycle === "YEARLY") {
        previousDate.setFullYear(previousDate.getFullYear() - 1);
    }

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
        return {
            canMarkPaid: true,
            label: "Pay Overdue",
            status: "OVERDUE",
        };
    }

    if (today >= cycleStartDate && today <= dueDate) {
        return {
            canMarkPaid: true,
            label: "Mark Paid",
            status: "CURRENT_CYCLE",
        };
    }

    return {
        canMarkPaid: false,
        label: "Not Due Yet",
        status: "TOO_EARLY",
    };
}

function getCategoryLabel(category: string) {
    return (
        recurringCategories.find((item) => item.value === category)?.label ||
        category
    );
}

function getCycleLabel(cycle: string) {
    return billingCycles.find((item) => item.value === cycle)?.label || cycle;
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
    icon: React.ElementType;
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

function RecurringListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="w-full space-y-3">
                            <div className="h-4 w-44 rounded bg-[#151B23]" />
                            <div className="h-3 w-28 rounded bg-[#151B23]" />
                            <div className="h-3 w-64 rounded bg-[#151B23]" />
                        </div>

                        <div className="h-9 w-24 rounded bg-[#151B23]" />
                    </div>
                </div>
            ))}
        </div>
    );
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

    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const isFirstRender = useRef(true);

    const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);


    const { onOpen, onEditOpen } = useRecurringModalStore();

    useEffect(() => {
        setRecurringExpenses(initialRecurringExpenses);
        setNextCursor(initialNextCursor);
    }, [initialRecurringExpenses, initialNextCursor]);

    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        const queryString = params.toString();

        startTransition(() => {
            router.replace(queryString ? `${pathname}?${queryString}` : pathname);
        });
    }

    function clearFilters() {
        setSearchValue("");

        startTransition(() => {
            router.replace(pathname);
        });
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            updateParam("search", searchValue);
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchValue]);

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
            setRecurringExpenses((prev) => [...prev, ...res.recurringExpenses]);
            setNextCursor(res.nextCursor);
        }

        setIsLoadingMore(false);
    }

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                }
            },
            {
                threshold: 1,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [nextCursor, isLoadingMore, filters]);

    async function handleStatusChange(item: RecurringExpenseItem) {
        const previousRecurring = recurringExpenses;
        const nextStatus = !item.isActive;

        setRecurringExpenses((prev) =>
            prev.map((recurring) =>
                recurring.id === item.id
                    ? {
                        ...recurring,
                        isActive: nextStatus,
                    }
                    : recurring
            )
        );

        const res = await updateRecurringStatus({
            id: item.id,
            isActive: nextStatus,
        });

        if (!res.ok) {
            setRecurringExpenses(previousRecurring);
            alert(res.error);
        }
    }

    async function handleMarkPaid(item: RecurringExpenseItem) {
        const markPaidState = getMarkPaidState(
            item.nextDueDate,
            item.billingCycle
        );

        if (!markPaidState.canMarkPaid) {
            alert("You can mark this as paid only when its billing cycle starts.");
            return;
        }

        const confirmed = confirm(
            `Mark "${item.name}" as paid?\n\nThis will create an expense and move the next due date forward.`
        );

        if (!confirmed) return;

        setMarkingPaidId(item.id);

        const res = await markRecurringPaid({
            id: item.id,
        });

        setMarkingPaidId(null);

        if (!res.ok || !res.updatedRecurring) {
            alert(res.error);
            return;
        }

        setRecurringExpenses((prev) =>
            prev.map((recurring) =>
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

        setRecurringExpenses((prev) => prev.filter((item) => item.id !== id));

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

    return (
        <div className="min-h-screen bg-[#010409] px-4 py-5 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2ea043] cursor-pointer"
                        onClick={onOpen}
                    >
                        <Plus size={17} />
                        Add Recurring
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
                        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scrollbar-hide">
                            <StatCard
                                title="Monthly Recurring"
                                value={formatCurrency(initialStats?.monthlyTotal || 0)}
                                subtitle="Expected monthly cost"
                                icon={Wallet}
                            />

                            <StatCard
                                title="Active Recurring"
                                value={`${initialStats?.activeRecurring || 0}`}
                                subtitle={`${initialStats?.totalRecurring || 0} total recurring`}
                                icon={RefreshCcw}
                            />

                            <StatCard
                                title="Upcoming Due"
                                value={initialStats?.upcomingDue?.name || "None"}
                                subtitle={
                                    initialStats?.upcomingDue
                                        ? getDaysLeft(initialStats.upcomingDue.date)
                                        : "No upcoming dues"
                                }
                                icon={CalendarDays}
                            />

                            <StatCard
                                title="Yearly Estimate"
                                value={formatCurrency(initialStats?.yearlyEstimate || 0)}
                                subtitle="Estimated yearly recurring cost"
                                icon={IndianRupee}
                            />
                        </div>

                        <div className="pointer-events-none absolute bottom-3 right-0 top-0 w-12 bg-linear-to-l from-[#010409] to-transparent md:hidden" />
                    </div>
                </div>

                <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                    <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]"
                            />

                            <input
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Search recurring expenses..."
                                className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
                            />
                        </div>

                        <select
                            value={filters.status || ""}
                            onChange={(event) => updateParam("status", event.target.value)}
                            className="h-11 rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF] cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        <select
                            value={filters.category || ""}
                            onChange={(event) => updateParam("category", event.target.value)}
                            className="h-11 rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF] cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {recurringCategories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.cycle || ""}
                            onChange={(event) => updateParam("cycle", event.target.value)}
                            className="h-11 rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF] cursor-pointer"
                        >
                            <option value="">All Cycles</option>
                            {billingCycles.map((cycle) => (
                                <option key={cycle.value} value={cycle.value}>
                                    {cycle.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.type || ""}
                            onChange={(event) => updateParam("type", event.target.value)}
                            className="h-11 rounded-xl border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF] cursor-pointer"
                        >
                            <option value="">All Types</option>
                            <option value="DUE_SOON">Due Soon</option>
                            <option value="OVERDUE">Overdue</option>
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
                    <RecurringListSkeleton />
                ) : recurringExpenses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#3D444D] bg-[#0D1117] px-6 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#151B23] text-[#58A6FF]">
                            <RefreshCcw size={22} />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-white">
                            No recurring expenses yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-[#8B949E]">
                            Add rent, bills, EMIs, fees, insurance, or any payment that repeats
                            regularly.
                        </p>

                        <button
                            type="button"
                            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#238636] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
                            onClick={onOpen}
                        >
                            <Plus size={17} />
                            Add Recurring Expense
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recurringExpenses.map((item) => {
                            const markPaidState = getMarkPaidState(
                                item.nextDueDate,
                                item.billingCycle
                            );
                            const isMarkingPaid = markingPaidId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4 transition hover:border-[#58A6FF]/50"
                                >

                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-semibold text-white">
                                                    {item.name}
                                                </h3>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive
                                                        ? "bg-[#238636]/15 text-[#3FB950]"
                                                        : "bg-[#6E7681]/15 text-[#8B949E]"
                                                        }`}
                                                >
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#8B949E]">
                                                <span>{getCategoryLabel(item.category)}</span>
                                                <span>{formatCurrency(item.amount)}</span>
                                                <span>{getCycleLabel(item.billingCycle)}</span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#151B23] px-3 py-1 text-[#C9D1D9]">
                                                    <Clock size={14} />
                                                    Next due: {formatDate(item.nextDueDate)}
                                                </span>

                                                <span className="rounded-full bg-[#151B23] px-3 py-1 text-[#58A6FF]">
                                                    {getDaysLeft(item.nextDueDate)}
                                                </span>
                                            </div>

                                            {item.note ? (
                                                <p className="mt-3 line-clamp-2 text-sm text-[#6E7681]">
                                                    {item.note}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex items-center gap-2 sm:justify-end">
                                            <button
                                                type="button"
                                                disabled={!markPaidState.canMarkPaid || isMarkingPaid}
                                                onClick={() => handleMarkPaid(item)}
                                                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition cursor-pointer ${markPaidState.status === "OVERDUE"
                                                    ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/15"
                                                    : markPaidState.canMarkPaid
                                                        ? "border-[#3D444D] bg-[#151B23] text-[#C9D1D9] hover:bg-[#21262D]"
                                                        : "cursor-not-allowed border-[#3D444D]/60 bg-[#0D1117] text-[#6E7681] opacity-60"
                                                    }`}
                                                title={
                                                    markPaidState.canMarkPaid
                                                        ? "Mark this recurring expense as paid"
                                                        : "You can mark this as paid when its billing cycle starts"
                                                }
                                            >
                                                {isMarkingPaid ? (
                                                    <>
                                                        <RefreshCcw size={16} className="animate-spin" />
                                                        Marking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={16} />
                                                        {markPaidState.label}
                                                    </>
                                                )}
                                            </button>

                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenMenuId(openMenuId === item.id ? null : item.id)
                                                    }
                                                    className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#C9D1D9] transition hover:bg-[#21262D]"
                                                >
                                                    <MoreVertical size={17} />
                                                </button>

                                                {openMenuId === item.id ? (
                                                    <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-[#3D444D] bg-[#151B23] shadow-xl">
                                                        <button
                                                            type="button"
                                                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#C9D1D9] hover:bg-[#21262D] cursor-pointer"
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                onEditOpen(item);
                                                            }}
                                                        >
                                                            <Edit size={15} />
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                handleStatusChange(item);
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#C9D1D9] hover:bg-[#21262D] cursor-pointer"
                                                        >
                                                            <RefreshCcw size={15} />
                                                            {item.isActive ? "Mark inactive" : "Mark active"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                handleDelete(item.id);
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 cursor-pointer"
                                                        >
                                                            <Trash2 size={15} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        )}

                        <div ref={loadMoreRef} className="h-8" />

                        {isLoadingMore ? <RecurringListSkeleton /> : null}
                    </div>
                )}
            </div>
            <AddRecurringModal />
            <EditRecurringModal />
        </div>
    );
}