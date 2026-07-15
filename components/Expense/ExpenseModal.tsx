"use client";

import { useEffect, useState } from "react";
import { Utensils, Car, ShoppingBag, ReceiptText } from "lucide-react";
import { ExpenseCategory } from "@/app/generated/prisma/client";
import { useExpenseModal } from "@/store/expense-modal-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { AddExpenseZod } from "@/lib/validators/addexpense";
import { Addexpense } from "@/actions/expense/addexpense";
import { updateExpense } from "@/actions/expense/updateExpense"
import { useRouter } from "next/navigation";


const categories = [
    { label: "Food", value: "FOOD", icon: Utensils },
    { label: "Travel", value: "TRAVEL", icon: Car },
    { label: "Shopping", value: "SHOPPING", icon: ShoppingBag },
    { label: "Other", value: "OTHER", icon: ReceiptText },
];

export default function AddExpenseModal() {
    const { open, onClose } = useExpenseModal();

    const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>("FOOD");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [data, setData] = useState({
        name: "",
        amount: 0,
        note: "",
    });
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { mode, expense } = useExpenseModal();

    useEffect(() => {
        if (mode === "edit" && expense) {
            setData({
                name: expense.name,
                amount: Number(expense.amount),
                note: expense.note || "",
            });

            setSelectedCategory(expense.category);
            setDate(new Date(expense.spentAt));
        }
    }, [mode, expense]);

    async function handelsubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        setLoading(true);
        setError("");

        if (!date) {
            setError("Please select a date");
            setLoading(false);
            return;
        }

        const selectedDate = new Date(date);
        const now = new Date();

        if (
            selectedDate.getFullYear() === now.getFullYear() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getDate() === now.getDate()
        ) {
            selectedDate.setHours(
                now.getHours(),
                now.getMinutes(),
                now.getSeconds(),
                now.getMilliseconds()
            );
        } else {
            selectedDate.setHours(12, 0, 0, 0);
        }

        const finalData = {
            ...data,
            category: selectedCategory,
            spentAt: selectedDate,
        };

        const result = AddExpenseZod.safeParse(finalData);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setError(
                fieldErrors.name?.[0] ||
                fieldErrors.amount?.[0] ||
                fieldErrors.category?.[0] ||
                fieldErrors.spentAt?.[0] ||
                fieldErrors.note?.[0] ||
                "Invalid input"
            );


            setLoading(false);

            return;
        }

        const res =
            mode === "edit" && expense
                ? await updateExpense(expense.id, result.data)
                : await Addexpense(result.data);

        if (!res.ok) {
            setError(res.error || "Something went wrong!");
            setLoading(false);
            return;
        }

        setData({
            name: "",
            amount: 0,
            note: "",
        });

        setSelectedCategory("FOOD");
        setDate(new Date());

        onClose();
        router.refresh();
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto border-border/70 bg-card p-0 text-foreground shadow-2xl sm:max-w-lg">
                <DialogHeader className="sticky top-0 z-10 border-b border-border/70 bg-card px-5 py-4 pr-12 sm:px-6">
                    <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                        {mode === "edit" ? "Edit Expense" : "Add Expense"}
                    </DialogTitle>
                </DialogHeader>

                {error ? (
                    <p className="mx-5 mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-500/20 sm:mx-6">
                        {error}
                    </p>
                ) : null}

                <div className="space-y-4 px-5 py-5 sm:px-6">

                    {/* Expense Name */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Expense Name
                        </label>

                        <input
                            type="text"
                            value={data.name}
                            placeholder="e.g. Swiggy Order"
                            onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                            className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Amount
                        </label>

                        <input
                            type="number"
                            min={0}
                            value={data.amount || ""}
                            placeholder="₹0"
                            onChange={(e) =>
                                setData((prev) => ({ ...prev, amount: Number(e.target.value) }))
                            }
                            className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Category
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((category) => {
                                const Icon = category.icon;

                                const active = selectedCategory === category.value;

                                return (
                                    <button
                                        key={category.label}
                                        type="button"
                                        onClick={() => setSelectedCategory(category.value as ExpenseCategory)}
                                        className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${active
                                            ? "border-primary/60 bg-primary/10 text-foreground"
                                            : "border-border/70 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {category.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Date
                        </label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className={cn(
                                        "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15",
                                        !date && "text-muted-foreground/70"
                                    )}
                                >
                                    {date ? format(date, "PPP") : "Pick a date"}

                                    <CalendarIcon size={18} className="text-muted-foreground" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent
                                align="start"
                                className="w-auto rounded-xl border border-border bg-card p-3 text-white shadow-2xl"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    classNames={{
                                        month_caption: "flex items-center justify-center text-white",
                                        caption_label: "text-sm font-medium text-white",

                                        button_previous:
                                            "absolute left-2 top-3 h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-white",
                                        button_next:
                                            "absolute right-2 top-3 h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-white",

                                        weekdays: "mt-4 flex",
                                        weekday:
                                            "w-9 text-center text-[0.8rem] font-normal text-muted-foreground",

                                        week: "mt-2 flex w-full",
                                        day: "h-9 w-9 p-0 text-center text-sm text-foreground",
                                        day_button:
                                            "h-9 w-9 rounded-md text-foreground transition hover:bg-muted hover:text-white",

                                        today:
                                            "rounded-md ring-1 ring-primary/50 text-foreground",

                                        selected:
                                            "rounded-md bg-primary text-white hover:bg-primary",

                                        outside: "text-[#484F58] opacity-60",
                                        disabled: "text-[#484F58] opacity-50",
                                        hidden: "invisible",
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Note */}
                    <textarea
                        rows={4}
                        value={data.note}
                        placeholder="Add a note..."
                        onChange={(e) => setData((prev) => ({ ...prev, note: e.target.value }))}
                        className="min-h-24 w-full resize-none rounded-lg border border-border/80 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                    />

                    {/* Buttons */}
                    <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-5 flex flex-col-reverse gap-2 border-t border-border/70 bg-card/95 px-5 py-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={(e) => handelsubmit(e)}
                            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    {mode === "edit" ? "Saving..." : "Adding..."}
                                </div>
                            ) : mode === "edit" ? (
                                "Save Changes"
                            ) : (
                                "Add Expense"
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}