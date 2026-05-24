"use client";

import { createSubscription } from "@/actions/subscription/create-subscription";
import { useSubscriptionModal } from "@/store/subscription-modal-store";
import {
    CalendarDays,
    Check,
    ChevronLeft,
    CreditCard,
    Loader2,
    Plus,
    Search,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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

type Step = "choose" | "plan" | "form";

type Props = {
    templates: SubscriptionTemplate[];
};

const categories = [
    "Entertainment",
    "Music",
    "AI Tools",
    "Design",
    "Productivity",
    "Cloud Storage",
    "Hosting",
    "Education",
    "Gaming",
    "Software",
    "Other",
];

const billingCycles: BillingCycle[] = [
    "MONTHLY",
    "QUARTERLY",
    "HALF_YEARLY",
    "YEARLY",
];

export function AddSubscriptionModal({ templates }: Props) {
    const router = useRouter();
    const { open, onClose } = useSubscriptionModal();

    const [step, setStep] = useState<Step>("choose");
    const [search, setSearch] = useState("");

    const [selectedTemplate, setSelectedTemplate] =
        useState<SubscriptionTemplate | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState("");

    const [name, setName] = useState("");
    const [planName, setPlanName] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
    const [nextRenewalDate, setNextRenewalDate] = useState<Date | undefined>();
    const [isActive, setIsActive] = useState(true);

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const filteredTemplates = useMemo(() => {
        const value = search.toLowerCase();

        return templates.filter(
            (template) =>
                template.name.toLowerCase().includes(value) ||
                template.category.toLowerCase().includes(value)
        );
    }, [templates, search]);

    function resetModal() {
        setStep("choose");
        setSearch("");

        setSelectedTemplate(null);
        setSelectedPlanId("");

        setName("");
        setPlanName("");
        setCategory("");
        setAmount("");
        setBillingCycle("MONTHLY");
        setNextRenewalDate(undefined);
        setIsActive(true);

        setError("");
        setSaving(false);
    }

    function closeModal() {
        resetModal();
        onClose();
    }

    function chooseTemplate(template: SubscriptionTemplate) {
        setSelectedTemplate(template);
        setSelectedPlanId("");
        setError("");
        setStep("plan");
    }

    function choosePlan(plan: SubscriptionPlan) {
        if (!selectedTemplate) return;

        setSelectedPlanId(plan.id);

        setName(selectedTemplate.name);
        setCategory(selectedTemplate.category);
        setPlanName(plan.name);
        setAmount(String(plan.amount));
        setBillingCycle(plan.billingCycle);
        setNextRenewalDate(undefined);
        setIsActive(true);

        setError("");
        setStep("form");
    }

    function continueTemplateWithoutPlan() {
        if (!selectedTemplate) return;

        setSelectedPlanId("");

        setName(selectedTemplate.name);
        setCategory(selectedTemplate.category);
        setPlanName("");
        setAmount("");
        setBillingCycle("MONTHLY");
        setNextRenewalDate(undefined);
        setIsActive(true);

        setError("");
        setStep("form");
    }

    function chooseCustom() {
        setSelectedTemplate(null);
        setSelectedPlanId("");

        setName("");
        setPlanName("");
        setCategory("");
        setAmount("");
        setBillingCycle("MONTHLY");
        setNextRenewalDate(undefined);
        setIsActive(true);

        setError("");
        setStep("form");
    }

    function goBackFromForm() {
        if (selectedTemplate) {
            setStep("plan");
        } else {
            setStep("choose");
        }

        setError("");
    }

    function getMaxAllowedRenewalDate(billingCycle: BillingCycle) {
            const maxDate = new Date();

            if (billingCycle === "MONTHLY") {
                maxDate.setMonth(maxDate.getMonth() + 2);
            }

            if (billingCycle === "QUARTERLY") {
                maxDate.setMonth(maxDate.getMonth() + 4);
            }

            if (billingCycle === "HALF_YEARLY") {
                maxDate.setMonth(maxDate.getMonth() + 7);
            }

            if (billingCycle === "YEARLY") {
                maxDate.setMonth(maxDate.getMonth() + 13);
            }

            maxDate.setHours(23, 59, 59, 999);

            return maxDate;
        }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Subscription name is required");
            return;
        }

        if (!category.trim()) {
            setError("Category is required");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setError("Amount must be greater than 0");
            return;
        }

        if (!nextRenewalDate) {
            setError("Next renewal date is required");
            return;
        }

        setSaving(true);

        const renewalDate = new Date(nextRenewalDate);
        renewalDate.setHours(12, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxAllowedDate = getMaxAllowedRenewalDate(billingCycle);

        if (renewalDate < today) {
            setError("Next renewal date cannot be in the past");
            return;
        }

        if (renewalDate > maxAllowedDate) {
            setError(
                `Next renewal date is too far for a ${formatBillingCycle(
                    billingCycle
                )} plan`
            );
            return;
        }

        const res = await createSubscription({
            templateId: selectedTemplate?.id ?? null,
            planId: selectedTemplate ? selectedPlanId || null : null,

            name: name.trim(),
            planName: planName.trim() || null,
            category,

            amount: Number(amount),
            billingCycle,
            nextRenewalDate: renewalDate,
            isActive,
        });

        setSaving(false);

        if (!res.ok) {
            setError(res.error || "Failed to add subscription");
            return;
        }

        closeModal();
        router.refresh();
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#3D444D] bg-[#0D1117] text-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#3D444D] px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {step === "choose" && "Add Subscription"}
                            {step === "plan" && "Select Plan"}
                            {step === "form" && "Subscription Details"}
                        </h2>

                        <p className="mt-0.5 text-sm text-[#8B949E]">
                            {step === "choose" &&
                                "Choose a subscription template or create a custom one."}
                            {step === "plan" &&
                                "Select the plan you are currently using."}
                            {step === "form" &&
                                "Review details and add the next renewal date."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-lg border border-[#3D444D] bg-[#151B23] p-2 text-[#8B949E] transition hover:text-white cursor-pointer"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-80px)] overflow-y-auto scrollbar-hide p-5">
                    {/* STEP 1: CHOOSE TEMPLATE / CUSTOM */}
                    {step === "choose" && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]"
                                />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Netflix, ChatGPT, Canva..."
                                    className="h-11 w-full rounded-lg border border-[#3D444D] bg-[#010409] pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={chooseCustom}
                                className="flex w-full items-center cursor-pointer gap-4 rounded-xl border border-[#3D444D] bg-[#151B23] p-4 text-left transition hover:border-[#58A6FF] hover:bg-[#1b222c]"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3D444D] bg-[#010409] text-[#58A6FF]">
                                    <Plus size={20} />
                                </div>

                                <div>
                                    <h3 className="font-medium text-white">
                                        Custom Subscription
                                    </h3>
                                    <p className="text-sm text-[#8B949E]">
                                        Add your own subscription manually.
                                    </p>
                                </div>
                            </button>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {filteredTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => chooseTemplate(template)}
                                        className="flex items-center gap-3 rounded-xl cursor-pointer border border-[#3D444D] bg-[#151B23] p-3 text-left transition hover:border-[#58A6FF] hover:bg-[#1b222c]"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3D444D] bg-[#010409]">
                                            {template.logo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={template.logo}
                                                    alt={template.name}
                                                    loading="lazy"
                                                    className="h-7 w-7 object-contain"
                                                />
                                            ) : (
                                                <CreditCard size={20} className="text-[#8B949E]" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-medium text-white">
                                                {template.name}
                                            </h3>
                                            <p className="truncate text-xs text-[#8B949E]">
                                                {template.category}
                                            </p>
                                        </div>
                                    </button>
                                ))}

                                {filteredTemplates.length === 0 && (
                                    <div className="col-span-full rounded-xl border border-dashed border-[#3D444D] p-8 text-center text-sm text-[#8B949E]">
                                        No templates found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SELECT PLAN */}
                    {step === "plan" && selectedTemplate && (
                        <div className="space-y-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep("choose");
                                    setSelectedTemplate(null);
                                    setSelectedPlanId("");
                                    setError("");
                                }}
                                className="inline-flex items-center gap-2 text-sm text-[#8B949E] transition hover:text-white"
                            >
                                <ChevronLeft size={16} />
                                Back to templates
                            </button>

                            <div className="flex items-center gap-3 rounded-xl border border-[#3D444D] bg-[#151B23] p-3">
                                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#3D444D] bg-[#010409]">
                                    {selectedTemplate.logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={selectedTemplate.logo}
                                            alt={selectedTemplate.name}
                                            loading="lazy"
                                            className="h-7 w-7 object-contain"
                                        />
                                    ) : (
                                        <CreditCard size={20} className="text-[#8B949E]" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-medium text-white">
                                        {selectedTemplate.name}
                                    </h3>
                                    <p className="text-sm text-[#8B949E]">
                                        {selectedTemplate.category}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-white">
                                    Choose your plan
                                </h3>
                                <p className="mt-1 text-sm text-[#8B949E]">
                                    Select the plan you use. You can edit amount and billing cycle
                                    later.
                                </p>
                            </div>

                            {selectedTemplate.plans.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {selectedTemplate.plans.map((plan) => (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => choosePlan(plan)}
                                            className="rounded-xl cursor-pointer border border-[#3D444D] bg-[#151B23] p-4 text-left transition hover:border-[#58A6FF] hover:bg-[#1b222c]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="font-medium text-white">
                                                        {plan.name}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-[#8B949E]">
                                                        {formatBillingCycle(plan.billingCycle)}
                                                    </p>
                                                </div>

                                                <p className="font-semibold text-white">
                                                    ₹{plan.amount.toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-[#3D444D] p-8 text-center">
                                    <p className="text-sm text-[#8B949E]">
                                        No plans found for this template.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={continueTemplateWithoutPlan}
                                        className="mt-4 rounded-lg border border-[#2f8132] bg-[#238636] px-4 py-2 text-sm text-white transition hover:bg-[#2ea043]"
                                    >
                                        Continue manually
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: FINAL FORM */}
                    {step === "form" && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <button
                                type="button"
                                onClick={goBackFromForm}
                                className="inline-flex items-center gap-2 text-sm text-[#8B949E] transition hover:text-white"
                            >
                                <ChevronLeft size={16} />
                                {selectedTemplate ? "Back to plans" : "Back to templates"}
                            </button>

                            {selectedTemplate && (
                                <div className="flex items-center gap-3 rounded-xl border border-[#3D444D] bg-[#151B23] p-3">
                                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#3D444D] bg-[#010409]">
                                        {selectedTemplate.logo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={selectedTemplate.logo}
                                                alt={selectedTemplate.name}
                                                loading="lazy"
                                                className="h-7 w-7 object-contain"
                                            />
                                        ) : (
                                            <CreditCard size={20} className="text-[#8B949E]" />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-white">
                                            {selectedTemplate.name}
                                        </h3>
                                        <p className="text-sm text-[#8B949E]">
                                            {selectedTemplate.category}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm text-[#C9D1D9]">
                                        Subscription Name
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Netflix"
                                        className="h-11 w-full rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-sm text-[#C9D1D9]">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="h-11 w-full rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF]"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Plan */}
                                {selectedTemplate ? (
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#C9D1D9]">
                                            Selected Plan
                                        </label>
                                        <div className="flex h-11 items-center rounded-lg border border-[#3D444D] bg-[#151B23] px-3 text-sm text-white">
                                            {planName || "No plan selected"}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#C9D1D9]">
                                            Plan Name{" "}
                                            <span className="text-[#6E7681]">(optional)</span>
                                        </label>
                                        <input
                                            value={planName}
                                            onChange={(e) => setPlanName(e.target.value)}
                                            placeholder="Premium / Basic / Pro"
                                            className="h-11 w-full rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
                                        />
                                    </div>
                                )}

                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="text-sm text-[#C9D1D9]">Amount</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        min={1}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="499"
                                        className="h-11 w-full rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
                                    />
                                </div>

                                {/* Billing Cycle */}
                                <div className="space-y-2">
                                    <label className="text-sm text-[#C9D1D9]">
                                        Billing Cycle
                                    </label>
                                    <select
                                        value={billingCycle}
                                        onChange={(e) =>
                                            setBillingCycle(e.target.value as BillingCycle)
                                        }
                                        className="h-11 w-full rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF]"
                                    >
                                        {billingCycles.map((cycle) => (
                                            <option key={cycle} value={cycle}>
                                                {formatBillingCycle(cycle)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Next Renewal Date */}
                                <div className="space-y-2">
                                    <label className="text-sm text-[#C9D1D9]">Next Renewal Date</label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "flex h-11 w-full items-center justify-between rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white transition hover:border-[#4B5563]",
                                                    !nextRenewalDate && "text-[#6E7681]"
                                                )}
                                            >
                                                {nextRenewalDate ? format(nextRenewalDate, "PPP") : "Pick renewal date"}

                                                <CalendarIcon size={18} className="text-[#8B949E]" />
                                            </button>
                                        </PopoverTrigger>

                                        <PopoverContent
                                            align="start"
                                            className="w-auto rounded-xl border border-[#3D444D] bg-[#0D1117] p-3 text-white shadow-2xl"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={nextRenewalDate}
                                                onSelect={setNextRenewalDate}
                                                captionLayout="dropdown"
                                                fixedWeeks
                                                startMonth={new Date(new Date().getFullYear(), 0)}
                                                endMonth={new Date(new Date().getFullYear() + 10, 11)}
                                                disabled={(date) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);

                                                    const maxAllowedDate = getMaxAllowedRenewalDate(billingCycle);

                                                    return date < today || date > maxAllowedDate;
                                                }}
                                                classNames={{
                                                    months: "relative",
                                                    month: "space-y-4",

                                                    month_caption: "flex items-center justify-center text-white",
                                                    caption_label: "hidden",

                                                    dropdowns: "flex items-center justify-center gap-2",
                                                    dropdown:
                                                        "rounded-md border border-[#3D444D] bg-[#010409] px-2 py-1 text-sm text-white outline-none hover:bg-[#151B23]",

                                                    button_previous:
                                                        "absolute left-2 top-1 h-7 w-7 rounded-md text-[#8B949E] hover:bg-[#151B23] hover:text-white",
                                                    button_next:
                                                        "absolute right-2 top-1 h-7 w-7 rounded-md text-[#8B949E] hover:bg-[#151B23] hover:text-white",

                                                    weekdays: "mt-4 flex",
                                                    weekday:
                                                        "w-9 text-center text-[0.8rem] font-normal text-[#8B949E]",

                                                    week: "mt-2 flex w-full",
                                                    day: "h-9 w-9 p-0 text-center text-sm text-[#C9D1D9]",
                                                    day_button:
                                                        "h-9 w-9 rounded-md text-[#C9D1D9] transition hover:bg-[#151B23] hover:text-white",

                                                    today: "rounded-md border border-[#58A6FF] text-white",
                                                    selected: "rounded-md bg-[#238636] text-white hover:bg-[#2ea043]",
                                                    outside: "text-[#484F58] opacity-60",
                                                    disabled: "text-[#484F58] opacity-50",
                                                    hidden: "invisible",
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="text-sm text-[#C9D1D9]">Status</label>
                                    <select
                                        value={isActive ? "ACTIVE" : "INACTIVE"}
                                        onChange={(e) => setIsActive(e.target.value === "ACTIVE")}
                                        className="h-11 w-full rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none focus:border-[#58A6FF]"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-[#3D444D] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="cursor-pointer inline-flex h-11 items-center justify-center rounded-lg border border-[#3D444D] bg-[#151B23] px-4 text-sm text-[#C9D1D9] transition hover:bg-[#1f2630] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#2f8132] bg-[#238636] px-4 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Add Subscription
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatBillingCycle(cycle: string) {
    if (cycle === "MONTHLY") return "Monthly";
    if (cycle === "QUARTERLY") return "Quarterly";
    if (cycle === "HALF_YEARLY") return "Half Yearly";
    if (cycle === "YEARLY") return "Yearly";

    return cycle;
}