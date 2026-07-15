"use client";

import { StyledSelect } from "@/components/ui/select";

import { updateSubscription } from "@/actions/subscription/update-subscription";
import { useSubscriptionModal } from "@/store/subscription-modal-store";
import { BillingCycle } from "@/app/generated/prisma/client";
import { CalendarIcon, CreditCard, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

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

export function EditSubscriptionModal() {
  const router = useRouter();

  const { editOpen, selectedSubscription, onEditClose } =
    useSubscriptionModal();

  const [name, setName] = useState("");
  const [planName, setPlanName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("MONTHLY");
  const [nextRenewalDate, setNextRenewalDate] = useState<Date | undefined>();
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSubscription) return;

    setName(selectedSubscription.name);
    setPlanName(selectedSubscription.planName || "");
    setCategory(selectedSubscription.category);
    setAmount(String(selectedSubscription.amount));
    setBillingCycle(selectedSubscription.billingCycle as BillingCycle);
    setNextRenewalDate(new Date(selectedSubscription.nextRenewalDate));
    setIsActive(selectedSubscription.isActive);
    setError("");
  }, [selectedSubscription]);

  function getMaxAllowedRenewalDate(cycle: BillingCycle) {
    const maxDate = new Date();

    if (cycle === "MONTHLY") {
      maxDate.setMonth(maxDate.getMonth() + 2);
    }

    if (cycle === "QUARTERLY") {
      maxDate.setMonth(maxDate.getMonth() + 4);
    }

    if (cycle === "HALF_YEARLY") {
      maxDate.setMonth(maxDate.getMonth() + 7);
    }

    if (cycle === "YEARLY") {
      maxDate.setMonth(maxDate.getMonth() + 13);
    }

    maxDate.setHours(23, 59, 59, 999);

    return maxDate;
  }

  function closeModal() {
    setError("");
    setLoading(false);
    onEditClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedSubscription) return;

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

    setLoading(true);

    const res = await updateSubscription(selectedSubscription.id, {
      name: name.trim(),
      planName: planName.trim() || null,
      category,
      amount: Number(amount),
      billingCycle,
      nextRenewalDate: renewalDate,
      isActive,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Failed to update subscription");
      return;
    }

    closeModal();
    router.refresh();
  }

  return (
    <Dialog open={editOpen} onOpenChange={closeModal}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto border-border/70 bg-card p-0 text-foreground shadow-2xl sm:max-w-lg">
        <DialogHeader className="sticky top-0 z-10 border-b border-border/70 bg-card px-5 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
            Edit Subscription
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="mx-5 mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-500/20 sm:mx-6">
            {error}
          </div>
        ) : null}

        {selectedSubscription ? (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 ring-1 ring-border/60">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white/90 ring-1 ring-black/10">
                {selectedSubscription.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedSubscription.logo}
                    alt={selectedSubscription.name}
                    loading="lazy"
                    className="h-7 w-7 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
                  />
                ) : (
                  <CreditCard size={20} className="text-muted-foreground" />
                )}
              </div>

              <div>
                <h3 className="font-medium text-white">
                  {selectedSubscription.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSubscription.category}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Subscription Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              {/* Plan Name */}
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

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="499"
                  className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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

            {/* Renewal Date */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Next Renewal Date
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-border/80 bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-border focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15",
                      !nextRenewalDate && "text-muted-foreground/70"
                    )}
                  >
                    {nextRenewalDate
                      ? format(nextRenewalDate, "PPP")
                      : "Pick renewal date"}

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

                      const maxAllowedDate =
                        getMaxAllowedRenewalDate(billingCycle);

                      return date < today || date > maxAllowedDate;
                    }}
                    classNames={{
                      months: "relative",
                      month: "space-y-4",

                      month_caption:
                        "flex items-center justify-center text-white",
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
                      day: "h-9 w-9 p-0 text-center text-xs font-medium text-muted-foreground",
                      day_button:
                        "h-9 w-9 rounded-md text-foreground transition hover:bg-muted hover:text-white",

                      today: "rounded-md ring-1 ring-primary/50 text-foreground",

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

            {/* Actions */}
            <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-5 flex flex-col-reverse gap-2 border-t border-border/70 bg-card/95 px-5 py-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save size={16} />
                    Save Changes
                  </div>
                )}
              </button>
            </div>
          </form>
        ) : null}
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