"use client";

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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#3D444D] bg-[#0D1117] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Edit Subscription
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        {selectedSubscription ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-[#3D444D] bg-[#151B23] p-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#3D444D] bg-[#010409]">
                {selectedSubscription.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedSubscription.logo}
                    alt={selectedSubscription.name}
                    loading="lazy"
                    className="h-7 w-7 object-contain"
                  />
                ) : (
                  <CreditCard size={20} className="text-[#8B949E]" />
                )}
              </div>

              <div>
                <h3 className="font-medium text-white">
                  {selectedSubscription.name}
                </h3>
                <p className="text-sm text-[#8B949E]">
                  {selectedSubscription.category}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm text-[#C9D1D9]">
                  Subscription Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              {/* Plan Name */}
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

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm text-[#C9D1D9]">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="499"
                  className="h-11 w-full rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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

            {/* Renewal Date */}
            <div className="space-y-2">
              <label className="text-sm text-[#C9D1D9]">
                Next Renewal Date
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex h-11 w-full items-center justify-between rounded-lg border border-[#3D444D] bg-[#010409] px-3 text-sm text-white transition hover:border-[#4B5563]",
                      !nextRenewalDate && "text-[#6E7681]"
                    )}
                  >
                    {nextRenewalDate
                      ? format(nextRenewalDate, "PPP")
                      : "Pick renewal date"}

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

            {/* Actions */}
            <div className="flex gap-3 border-t border-[#3D444D] pt-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="flex-1 rounded-xl border border-[#3D444D] bg-[#151B23] px-4 py-3 text-sm font-medium text-[#C9D1D9] transition hover:bg-[#1f2630] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#2ea043] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#238636] disabled:cursor-not-allowed disabled:opacity-60"
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