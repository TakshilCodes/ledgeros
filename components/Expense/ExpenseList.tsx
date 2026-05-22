"use client";

import { useEffect, useRef, useState } from "react";
import { format, isToday } from "date-fns";
import { useRouter } from "next/navigation";
import {
    Car,
    MoreVertical,
    Pencil,
    ReceiptText,
    ShoppingBag,
    Trash2,
    Utensils,
    CreditCard,
} from "lucide-react";

import { getExpenses } from "@/actions/expense/getExpenses";
import { deleteExpense } from "@/actions/expense/deleteExpense";
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
    FOOD: {
        label: "Food",
        icon: Utensils,
    },
    TRAVEL: {
        label: "Travel",
        icon: Car,
    },
    SHOPPING: {
        label: "Shopping",
        icon: ShoppingBag,
    },
    SUBSCRIPTION: {
        label: "Subscription",
        icon: CreditCard,
    },
    OTHER: {
        label: "Other",
        icon: ReceiptText,
    },
};

function formatExpenseDate(date: Date | string) {
    const expenseDate = new Date(date);

    if (isToday(expenseDate)) {
        return `Today, ${format(expenseDate, "h:mm a")}`;
    }

    return format(expenseDate, "dd MMM yyyy");
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

        const res = await getExpenses({
            cursor,
            ...filters,
        });

        setExpenses((prev) => [...prev, ...res.expenses]);
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
            {
                rootMargin: "200px",
                threshold: 0.1,
            }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [cursor, loading, filters]);

    async function handleDelete(id: string) {
        const confirmDelete = confirm("Are you sure you want to delete this expense?");

        if (!confirmDelete) return;

        const previousExpenses = expenses;

        setDeletingId(id);
        setExpenses((prev) => prev.filter((expense) => expense.id !== id));

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

        onEditOpen({
            ...expense,
            spentAt: new Date(expense.spentAt),
        });
    }

    if (expenses.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-[#3D444D] bg-[#010409] px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#151B23] text-[#58A6FF]">
                    <ReceiptText size={22} />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-white">
                    No expenses found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#8B949E]">
                    Add your first expense or clear filters to see your spending history.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense) => {
                const config =
                    categoryConfig[expense.category as keyof typeof categoryConfig] ||
                    categoryConfig.OTHER;

                const Icon = config.icon;
                const isMenuOpen = openMenuId === expense.id;
                const isDeleting = deletingId === expense.id;

                return (
                    <div
                        key={expense.id}
                        className="rounded-2xl border border-[#3D444D] bg-[#010409] p-4 transition hover:border-[#58A6FF]/40"
                    >
                        {/* Desktop / tablet layout */}
                        <div className="hidden items-start justify-between gap-4 md:flex">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                                    <Icon size={22} />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="truncate text-base font-semibold text-white">
                                            {expense.name}
                                        </h3>

                                        <span className="rounded-full bg-[#151B23] px-2.5 py-1 text-xs font-medium text-[#8B949E]">
                                            {config.label}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#8B949E]">
                                        <span>{formatExpenseDate(expense.spentAt)}</span>

                                        {expense.note ? (
                                            <span className="max-w-105 truncate">{expense.note}</span>
                                        ) : null}
                                    </div>

                                    <div className="mt-3 text-sm">

                                        <span className="rounded-full bg-[#151B23] px-3 py-1 text-[#58A6FF]">
                                            {formatExpenseDate(expense.spentAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <p className="text-lg font-semibold text-white">
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
                        </div>

                        {/* Mobile layout */}
                        <div className="md:hidden">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#58A6FF]">
                                    <Icon size={20} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="space-y-1">
                                        <h3 className="wrap-break-word text-base font-semibold leading-5 text-white">
                                            {expense.name}
                                        </h3>

                                        <p className="text-sm text-[#8B949E]">{config.label}</p>

                                        <p className="text-lg font-semibold text-white">
                                            {formatCurrency(Number(expense.amount))}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-[#3D444D] bg-[#151B23] px-3 py-2">
                                <p className="text-xs text-[#8B949E]">Spent on</p>
                                <p className="mt-1 text-sm font-medium text-[#C9D1D9]">
                                    {formatExpenseDate(expense.spentAt)}
                                </p>
                            </div>

                            {expense.note ? (
                                <div className="mt-3 rounded-xl border border-[#3D444D] bg-[#151B23] px-3 py-2">
                                    <p className="text-xs text-[#8B949E]">Note</p>
                                    <p className="mt-1 wrap-break-word text-sm leading-5 text-[#C9D1D9]">
                                        {expense.note}
                                    </p>
                                </div>
                            ) : null}

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <span className="rounded-full border border-[#3D444D] bg-[#151B23] px-3 py-1 text-xs text-[#8B949E]">
                                    {config.label}
                                </span>

                                <ExpenseMenu
                                    expense={expense}
                                    isMenuOpen={isMenuOpen}
                                    isDeleting={isDeleting}
                                    setOpenMenuId={setOpenMenuId}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}

            <div ref={loaderRef} className="py-4">
                {loading ? (
                    <ExpenseScrollSkeleton />
                ) : cursor ? (
                    <p className="text-center text-sm text-[#8B949E]">Scroll for more</p>
                ) : (
                    <p className="text-center text-sm text-[#8B949E]">No more expenses</p>
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
                    aria-label="Close expense menu"
                    onClick={() => setOpenMenuId(null)}
                    className="fixed inset-0 z-40 cursor-default bg-transparent"
                />
            ) : null}

            <button
                type="button"
                onClick={() => {
                    setOpenMenuId(isMenuOpen ? null : expense.id);
                }}
                className="relative z-50 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#3D444D] bg-[#151B23] text-[#C9D1D9] transition hover:bg-[#21262D]"
            >
                <MoreVertical size={17} />
            </button>

            {isMenuOpen ? (
                <div className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-xl border border-[#3D444D] bg-[#151B23] shadow-2xl">
                    <button
                        type="button"
                        onClick={() => onEdit(expense)}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-[#C9D1D9] hover:bg-[#21262D]"
                    >
                        <Pencil size={15} />
                        Edit
                    </button>

                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => onDelete(expense.id)}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Trash2 size={15} />
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            ) : null}
        </div>
    );
}

function ExpenseScrollSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-[#3D444D] bg-[#010409] p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-xl bg-[#151B23]" />

                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-40 rounded bg-[#151B23]" />
                            <div className="h-3 w-28 rounded bg-[#151B23]" />
                            <div className="h-9 w-full rounded-xl bg-[#151B23]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}