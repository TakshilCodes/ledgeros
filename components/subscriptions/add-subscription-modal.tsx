"use client";

import { StyledSelect } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
        <Dialog open={open} onOpenChange={(value) => !value && closeModal()}>
            <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-1.5rem)] max-w-2xl overflow-hidden border-border/70 bg-card p-0 text-foreground shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border/70 px-5 py-4 pr-4 sm:px-6">
                    <div>
                        <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                            {step === "choose" && "Add Subscription"}
                            {step === "plan" && "Select Plan"}
                            {step === "form" && "Subscription Details"}
                        </DialogTitle>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
                        aria-label="Close add subscription dialog"
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="max-h-[calc(100dvh-5.75rem)] overflow-y-auto p-4 sm:p-5">
                    {/* STEP 1: CHOOSE TEMPLATE / CUSTOM */}
                    {step === "choose" && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Netflix, ChatGPT, Canva..."
                                    className="h-10 w-full rounded-lg border border-border/80 bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={chooseCustom}
                                className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-muted/40 p-3 text-left ring-1 ring-border/60 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            >
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Plus size={20} />
                                </div>

                                <div>
                                    <h3 className="font-medium text-white">
                                        Custom Subscription
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Add your own subscription manually.
                                    </p>
                                </div>
                            </button>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {filteredTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => chooseTemplate(template)}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/70 bg-muted/40 p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    >
                                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/90 ring-1 ring-black/10">
                                            {template.logo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={template.logo}
                                                    alt={template.name}
                                                    loading="lazy"
                                                    className="h-7 w-7 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
                                                />
                                            ) : (
                                                <CreditCard size={20} className="text-muted-foreground" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-medium text-white">
                                                {template.name}
                                            </h3>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {template.category}
                                            </p>
                                        </div>
                                    </button>
                                ))}

                                {filteredTemplates.length === 0 && (
                                    <div className="col-span-full rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
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
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-white"
                            >
                                <ChevronLeft size={16} />
                                Back to templates
                            </button>

                            <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 ring-1 ring-border/60">
                                <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-white/90 ring-1 ring-black/10">
                                    {selectedTemplate.logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={selectedTemplate.logo}
                                            alt={selectedTemplate.name}
                                            loading="lazy"
                                            className="h-7 w-7 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
                                        />
                                    ) : (
                                        <CreditCard size={20} className="text-muted-foreground" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-medium text-white">
                                        {selectedTemplate.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedTemplate.category}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-white">
                                    Choose your plan
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Select the plan you use. You can edit amount and billing cycle
                                    later.
                                </p>
                            </div>

                            {selectedTemplate.plans.length > 0 ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {selectedTemplate.plans.map((plan) => (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => choosePlan(plan)}
                                            className="cursor-pointer rounded-lg border border-border/70 bg-muted/40 p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="font-medium text-white">
                                                        {plan.name}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-muted-foreground">
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
                                <div className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No plans found for this template.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={continueTemplateWithoutPlan}
                                        className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-white"
                            >
                                <ChevronLeft size={16} />
                                {selectedTemplate ? "Back to plans" : "Back to templates"}
                            </button>

                            {selectedTemplate && (
                                <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 ring-1 ring-border/60">
                                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-white/90 ring-1 ring-black/10">
                                        {selectedTemplate.logo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={selectedTemplate.logo}
                                                alt={selectedTemplate.name}
                                                loading="lazy"
                                                className="h-7 w-7 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
                                            />
                                        ) : (
                                            <CreditCard size={20} className="text-muted-foreground" />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-white">
                                            {selectedTemplate.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
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
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Subscription Name
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Netflix"
                                        className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Category</label>
                                    <StyledSelect
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </StyledSelect>
                                </div>

                                {/* Plan */}
                                {selectedTemplate ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Selected Plan
                                        </label>
                                        <div className="flex h-10 items-center rounded-lg bg-muted/50 px-3 text-sm text-foreground ring-1 ring-border/60">
                                            {planName || "No plan selected"}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Plan Name{" "}
                                            <span className="text-muted-foreground/70">(optional)</span>
                                        </label>
                                        <input
                                            value={planName}
                                            onChange={(e) => setPlanName(e.target.value)}
                                            placeholder="Premium / Basic / Pro"
                                            className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                                        />
                                    </div>
                                )}

                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Amount</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        min={1}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="499"
                                        className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                                    />
                                </div>

                                {/* Billing Cycle */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Billing Cycle
                                    </label>
                                    <StyledSelect
                                        value={billingCycle}
                                        onChange={(e) =>
                                            setBillingCycle(e.target.value as BillingCycle)
                                        }
                                        className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                                    >
                                        {billingCycles.map((cycle) => (
                                            <option key={cycle} value={cycle}>
                                                {formatBillingCycle(cycle)}
                                            </option>
                                        ))}
                                    </StyledSelect>
                                </div>

                                {/* Next Renewal Date */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Next Renewal Date</label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15",
                                                    !nextRenewalDate && "text-muted-foreground/70"
                                                )}
                                            >
                                                {nextRenewalDate ? format(nextRenewalDate, "PPP") : "Pick renewal date"}

                                                <CalendarIcon size={18} className="text-muted-foreground" />
                                            </button>
                                        </PopoverTrigger>

                                        <PopoverContent
                                            align="start"
                                            className="w-auto rounded-xl border border-border bg-card p-3 text-white shadow-2xl"
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
                                                        "rounded-md border border-border bg-background px-2 py-1 text-sm text-white outline-none hover:bg-muted",

                                                    button_previous:
                                                        "absolute left-2 top-1 h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-white",
                                                    button_next:
                                                        "absolute right-2 top-1 h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-white",

                                                    weekdays: "mt-4 flex",
                                                    weekday:
                                                        "w-9 text-center text-[0.8rem] font-normal text-muted-foreground",

                                                    week: "mt-2 flex w-full",
                                                    day: "h-9 w-9 p-0 text-center text-sm text-foreground",
                                                    day_button:
                                                        "h-9 w-9 rounded-md text-foreground transition hover:bg-muted hover:text-white",

                                                    today: "rounded-md ring-1 ring-primary/50 text-foreground",
                                                    selected: "rounded-md bg-primary text-white hover:bg-primary",
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
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <StyledSelect
                                        value={isActive ? "ACTIVE" : "INACTIVE"}
                                        onChange={(e) => setIsActive(e.target.value === "ACTIVE")}
                                        className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </StyledSelect>
                                </div>
                            </div>

                            <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-5 flex flex-col-reverse gap-2 border-t border-border/70 bg-card/95 px-4 py-4 sm:-mx-5 sm:-mb-5 sm:flex-row sm:justify-end sm:px-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
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
            </DialogContent>
        </Dialog>
    );
}

function formatBillingCycle(cycle: string) {
    if (cycle === "MONTHLY") return "Monthly";
    if (cycle === "QUARTERLY") return "Quarterly";
    if (cycle === "HALF_YEARLY") return "Half Yearly";
    if (cycle === "YEARLY") return "Yearly";

    return cycle;
}