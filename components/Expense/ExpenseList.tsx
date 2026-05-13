"use client";

import { useEffect, useRef, useState } from "react";
import { format, isToday } from "date-fns";
import {
    Utensils,
    Car,
    ShoppingBag,
    ReceiptText,
    Pencil,
    Trash2,
} from "lucide-react";

import { getExpenses } from "@/actions/expense/getExpenses";
import { deleteExpense } from "@/actions/expense/deleteExpense";
import { useRouter } from "next/navigation";
import { useExpenseModal } from "@/store/expense-modal-store";

type Expense = {
    id: string;
    name: string;
    amount: any;
    category: string;
    note: string | null;
    spentAt: Date;
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
    OTHER: {
        label: "Other",
        icon: ReceiptText,
    },
};

function formatExpenseDate(date: Date) {
    const expenseDate = new Date(date);

    if (isToday(expenseDate)) {
        return `Today, ${format(expenseDate, "h:mm a")}`;
    }

    return format(expenseDate, "dd MMM yyyy");
}

export default function ExpensesList({
    initialExpenses,
    initialCursor,
    filters
}: {
    initialExpenses: Expense[];
    initialCursor: string | null;
    filters: {
        search?: string;
        category?: string;
        date?: string;
        sort?: string;
    };
}) {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [cursor, setCursor] = useState(initialCursor);
    const [loading, setLoading] = useState(false);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { onEditOpen } = useExpenseModal();

    const loaderRef = useRef<HTMLDivElement | null>(null);

    const router = useRouter();

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
        setExpenses(initialExpenses);
        setCursor(initialCursor);
    }, [initialExpenses, initialCursor]);

    useEffect(() => {
        const target = loaderRef.current;
        if (!target) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        });

        observer.observe(target);

        return () => observer.disconnect();
    }, [cursor, loading, filters]);

    async function handleDelete(id: string) {
        const confirmDelete = confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmDelete) return;

        setDeletingId(id);

        const res = await deleteExpense(id);

        if (res.ok) {
            setExpenses((prev) => prev.filter((expense) => expense.id !== id));

            router.refresh();
        }

        setDeletingId(null);
    }

    if (expenses.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-[#3D444D] bg-[#010409] px-4 py-10 text-center">
                <p className="text-sm font-medium text-white">No expenses yet</p>
                <p className="mt-1 text-xs text-[#8B949E]">
                    Add your first expense to start tracking.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {expenses.map((expense) => {
                const config =
                    categoryConfig[expense.category as keyof typeof categoryConfig] ||
                    categoryConfig.OTHER;

                const Icon = config.icon;

                return (
                    <div
                        key={expense.id}
                        className="group rounded-xl border border-[#3D444D] bg-[#010409] p-3 transition hover:border-[#4B5563] hover:bg-[#11161d] cursor-pointer"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#151B23] text-[#58A6FF]">
                                    <Icon size={18} />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-medium text-white">
                                        {expense.name}
                                    </h3>

                                    <p className="mt-0.5 text-xs text-[#8B949E]">
                                        {config.label} • {formatExpenseDate(expense.spentAt)}
                                    </p>

                                    {expense.note && (
                                        <p className="mt-1 line-clamp-2 text-xs text-[#6E7681]">
                                            Note: {expense.note}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold text-white">
                                    ₹{Number(expense.amount).toLocaleString("en-IN")}
                                </p>

                                <div className="mt-2 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                                    <button
                                        onClick={() => onEditOpen(expense)}
                                        className="rounded-lg border border-[#3D444D] bg-[#151B23] p-2 text-[#8B949E] transition hover:text-white"
                                    >
                                        <Pencil size={14} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(expense.id)}
                                        disabled={deletingId === expense.id}
                                        className="rounded-lg border border-[#3D444D] bg-[#151B23] p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
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

function ExpenseScrollSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="animate-pulse rounded-xl border border-[#3D444D] bg-[#010409] p-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#151B23]" />

                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-32 rounded bg-[#151B23]" />
                            <div className="h-3 w-44 rounded bg-[#151B23]" />
                            <div className="h-3 w-56 rounded bg-[#151B23]" />
                        </div>

                        <div className="h-4 w-16 rounded bg-[#151B23]" />
                    </div>
                </div>
            ))}
        </div>
    );
}