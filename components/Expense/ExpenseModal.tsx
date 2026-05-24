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
            <DialogContent className="border-[#3D444D] bg-[#0D1117] text-white sm:max-w-lg">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="text-lg font-semibold">
                        {mode === "edit" ? "Edit Expense" : "Add Expense"}
                    </DialogTitle>
                </DialogHeader>

                {error ? <p className="text-red-500">{error}</p> : null}

                <div className="mt-4 space-y-5">

                    {/* Expense Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                            Expense Name
                        </label>

                        <input
                            type="text"
                            value={data.name}
                            placeholder="e.g. Swiggy Order"
                            onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full rounded-xl border border-[#3D444D] bg-[#010409] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white">
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
                            className="w-full rounded-xl border border-[#3D444D] bg-[#010409] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="mb-3 block text-sm font-medium text-white">
                            Category
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((category) => {
                                const Icon = category.icon;

                                const active = selectedCategory === category.value;

                                return (
                                    <button
                                        key={category.label}
                                        type="button"
                                        onClick={() => setSelectedCategory(category.value as ExpenseCategory)}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition cursor-pointer ${active
                                            ? "border-[#238636] bg-[#238636]/10 text-white"
                                            : "border-[#3D444D] bg-[#151B23] text-[#8B949E] hover:border-[#4B5563] hover:bg-[#1a212b] hover:text-white"
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
                        <label className="mb-2 block text-sm font-medium text-white">
                            Date
                        </label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className={cn(
                                        "flex h-12 w-full items-center justify-between rounded-xl border border-[#3D444D] bg-[#010409] px-4 text-sm text-white transition hover:border-[#4B5563]",
                                        !date && "text-[#6E7681]"
                                    )}
                                >
                                    {date ? format(date, "PPP") : "Pick a date"}

                                    <CalendarIcon size={18} className="text-[#8B949E]" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent
                                align="start"
                                className="w-auto rounded-xl border border-[#3D444D] bg-[#0D1117] p-3 text-white shadow-2xl"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    classNames={{
                                        month_caption: "flex items-center justify-center text-white",
                                        caption_label: "text-sm font-medium text-white",

                                        button_previous:
                                            "absolute left-2 top-3 h-7 w-7 rounded-md text-[#8B949E] hover:bg-[#151B23] hover:text-white",
                                        button_next:
                                            "absolute right-2 top-3 h-7 w-7 rounded-md text-[#8B949E] hover:bg-[#151B23] hover:text-white",

                                        weekdays: "mt-4 flex",
                                        weekday:
                                            "w-9 text-center text-[0.8rem] font-normal text-[#8B949E]",

                                        week: "mt-2 flex w-full",
                                        day: "h-9 w-9 p-0 text-center text-sm text-[#C9D1D9]",
                                        day_button:
                                            "h-9 w-9 rounded-md text-[#C9D1D9] transition hover:bg-[#151B23] hover:text-white",

                                        today:
                                            "rounded-md border border-[#58A6FF] text-white",

                                        selected:
                                            "rounded-md bg-[#238636] text-white hover:bg-[#2ea043]",

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
                        className="w-full resize-none rounded-xl border border-[#3D444D] bg-[#010409] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6E7681] focus:border-[#238636]"
                    />

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded-xl cursor-pointer border border-[#3D444D] bg-[#151B23] px-4 py-3 text-sm font-medium text-[#C9D1D9] transition hover:bg-[#1f2630]"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={(e) => handelsubmit(e)}
                            className="flex-1 rounded-xl cursor-pointer bg-[#2ea043] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#238636] disabled:cursor-not-allowed disabled:opacity-60"
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