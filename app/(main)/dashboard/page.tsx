import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  Flame,
  ReceiptText,
  Wallet,
  CreditCard,
  PiggyBank,
  Utensils,
  Car,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const summaryCards = [
  { title: "Today's Spend", value: "₹1,250", subtitle: "vs yesterday ₹820", icon: ReceiptText },
  { title: "This Month's Spend", value: "₹18,560", subtitle: "vs last month ₹15,200", icon: Wallet },
  { title: "Subscriptions Total", value: "₹2,340 /month", subtitle: "6 active", icon: CreditCard },
  { title: "Budget Left", value: "₹6,440", subtitle: "32% of ₹24,000 used", icon: PiggyBank },
];

const recentExpenses = [
  { name: "Lunch", category: "Food", amount: "₹250", time: "Today, 1:30 PM", icon: Utensils },
  { name: "Swiggy Order", category: "Food", amount: "₹420", time: "Today, 12:45 PM", icon: Utensils },
  { name: "Uber Ride", category: "Travel", amount: "₹180", time: "Today, 9:15 AM", icon: Car },
  { name: "Chai & Snacks", category: "Food", amount: "₹80", time: "Today, 8:30 AM", icon: Utensils },
];

const renewals = [
  { name: "Netflix", plan: "Premium Plan", amount: "₹649", due: "Tomorrow" },
  { name: "ChatGPT Plus", plan: "Plus Plan", amount: "₹1,999", due: "In 3 days" },
  { name: "Spotify", plan: "Premium Plan", amount: "₹119", due: "In 5 days" },
  { name: "Canva Pro", plan: "Pro Plan", amount: "₹499", due: "In 12 days" },
];

const categoryBudgets = [
  { name: "Food", used: 85, amount: "₹8,500 / ₹10,000", icon: Utensils },
  { name: "Travel", used: 60, amount: "₹3,000 / ₹5,000", icon: Car },
  { name: "Shopping", used: 45, amount: "₹2,250 / ₹5,000", icon: ShoppingBag },
];

const cardClass =
  "rounded-xl border border-[#3D444D] bg-[#0D1117] p-4 transition-all duration-300 hover:border-[#58A6FF]/50 hover:shadow-[0_12px_40px_rgba(88,166,255,0.08)]";

function MonthSelect() {
  return (
    <div className="relative">
      <select
        defaultValue="this-month"
        className="h-8 cursor-pointer appearance-none rounded-lg border border-[#3D444D] bg-[#151B23] px-3 pr-8 text-xs text-[#C9D1D9] outline-none transition hover:bg-[#1f2630] focus:border-[#238636]"
      >
        <option value="this-month">This Month</option>
        <option value="last-month">Last Month</option>
        <option value="last-3-months">Last 3 Months</option>
        <option value="this-year">This Year</option>
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E]"
      />
    </div>
  );
}

function ViewAllLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-medium text-[#58A6FF] underline-offset-4 transition hover:underline"
    >
      View All
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-3 md:space-y-4">
      <section>
        <h1 className="text-lg font-semibold text-white md:text-xl">
          Welcome back 👋
        </h1>
        <p className="mt-0.5 text-xs text-[#8B949E] md:text-sm">
          Here&apos;s your financial overview.
        </p>
      </section>

      <section className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 md:grid md:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group min-w-43.75 rounded-xl border border-[#3D444D] bg-[#0D1117] p-3 shadow-sm transition-all duration-300 hover:border-[#4B5563] hover:bg-[#11161d] md:min-w-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#151B23] text-[#58A6FF] transition-transform duration-300 group-hover:scale-110">
                    <Icon size={15} />
                  </div>

                  <ArrowUpRight size={14} className="text-[#2ea043]" />
                </div>

                <p className="text-[11px] text-[#C9D1D9]">{card.title}</p>

                <h2 className="mt-1 text-lg font-semibold text-white md:text-xl">
                  {card.value}
                </h2>

                <p className="mt-1 line-clamp-1 text-[11px] text-[#8B949E]">
                  {card.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200 transition-all duration-300 hover:border-yellow-400/50 hover:bg-yellow-500/15 md:text-sm">
        <AlertTriangle className="mt-0.5 shrink-0 text-yellow-400" size={18} />
        <p>
          You&apos;ve spent <span className="font-semibold">₹980</span> on Food
          today. You&apos;re close to your daily limit of ₹1,000.
        </p>
      </section>

      <section className="grid gap-3 md:gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-3 md:space-y-4">
          <div className={cardClass}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white md:text-base">
                Expense Overview
              </h2>
              <MonthSelect />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex min-h-45 items-center justify-center rounded-xl border border-dashed border-[#3D444D] bg-[#010409]/60 transition-all duration-300 hover:border-[#58A6FF]/40 hover:bg-[#010409] md:min-h-52.5">
                <p className="text-xs text-[#8B949E] md:text-sm">
                  Donut chart placeholder
                </p>
              </div>

              <div className="flex min-h-45 items-center justify-center rounded-xl border border-dashed border-[#3D444D] bg-[#010409]/60 transition-all duration-300 hover:border-[#58A6FF]/40 hover:bg-[#010409] md:min-h-52.5">
                <p className="text-xs text-[#8B949E] md:text-sm">
                  Bar chart placeholder
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
            <div className={cardClass}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white md:text-base">
                  Recent Expenses
                </h2>
                <ViewAllLink href="/dashboard/expenses" />
              </div>

              <div className="space-y-1">
                {recentExpenses.map((expense) => {
                  const Icon = expense.icon;

                  return (
                    <div
                      key={expense.name}
                      className="group flex items-center justify-between rounded-xl border-b border-[#3D444D]/50 px-2 py-2 transition-all duration-200 hover:bg-[#151B23] last:border-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#151B23] text-[#58A6FF] transition-transform duration-200 group-hover:scale-110">
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {expense.name}
                          </p>
                          <p className="text-xs text-[#8B949E]">
                            {expense.category}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium text-white">
                          {expense.amount}
                        </p>
                        <p className="text-[11px] text-[#8B949E]">
                          {expense.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white md:text-base">
                  Upcoming Renewals
                </h2>
                <ViewAllLink href="/dashboard/subscriptions" />
              </div>

              <div className="space-y-1">
                {renewals.map((item) => (
                  <div
                    key={item.name}
                    className="group flex items-center justify-between rounded-xl border-b border-[#3D444D]/50 px-2 py-2 transition-all duration-200 hover:bg-[#151B23] last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#151B23] text-[#2ea043] transition-transform duration-200 group-hover:scale-110">
                        <CalendarClock size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#8B949E]">{item.plan}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-white">
                        {item.amount}
                      </p>
                      <p className="text-[11px] text-yellow-400">{item.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className={cardClass}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white md:text-base">
                Budget Overview
              </h2>
              <MonthSelect />
            </div>

            <div className="group rounded-xl p-2 transition hover:bg-[#151B23]">
              <div className="mb-2 flex justify-between text-xs md:text-sm">
                <span className="text-[#8B949E]">Total Budget</span>
                <span className="font-medium text-white">₹24,000</span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-[#151B23]">
                <div className="h-full w-[73%] rounded-full bg-[#2ea043] transition-all duration-500 group-hover:w-[78%]" />
              </div>

              <div className="mt-2 flex justify-between text-xs md:text-sm">
                <span className="text-white">₹17,560 spent</span>
                <span className="text-[#2ea043]">₹6,440 left</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">
                  Category Budget
                </h3>
                <ViewAllLink href="/dashboard/budgets" />
              </div>

              {categoryBudgets.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.name}
                    className="group rounded-xl p-2 transition hover:bg-[#151B23]"
                  >
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <div className="flex items-center gap-2 text-white">
                        <Icon
                          size={15}
                          className="text-[#8B949E] transition group-hover:text-[#58A6FF]"
                        />
                        {item.name}
                      </div>

                      <span className="text-[#8B949E]">{item.amount}</span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#151B23]">
                      <div
                        className="h-full rounded-full bg-[#58A6FF] transition-all duration-500 group-hover:bg-[#2ea043]"
                        style={{ width: `${item.used}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Flame className="text-orange-400" size={18} />
              <h2 className="text-sm font-semibold text-white md:text-base">
                No Spend Streak
              </h2>
            </div>

            <h3 className="text-2xl font-bold text-orange-400">3 Days</h3>
            <p className="mt-1 text-xs text-[#8B949E] md:text-sm">
              Keep it up! You&apos;re on fire 🔥
            </p>

            <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div key={index} className="text-center">
                  <p className="mb-1 text-[11px] text-[#8B949E]">{day}</p>
                  <div
                    className={`h-7 w-7 rounded-full border transition-all duration-200 hover:scale-110 ${
                      index < 3
                        ? "border-[#2ea043] bg-[#2ea043] shadow-[0_0_18px_rgba(46,160,67,0.25)]"
                        : "border-[#3D444D] bg-[#151B23] hover:border-[#58A6FF]"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white md:text-base">
                Weekly Report
              </h2>

              <Link
                href="/dashboard/insights"
                className="text-xs font-medium text-[#58A6FF] underline-offset-4 transition hover:underline"
              >
                Full Report
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs text-[#8B949E] md:text-sm">This Week</p>
                <h3 className="mt-1 text-xl font-semibold text-white md:text-2xl">
                  ₹6,750
                </h3>
                <p className="mt-1 text-xs text-[#8B949E]">Total Spend</p>
              </div>

              <div className="space-y-2 text-xs md:text-sm">
                <p className="flex gap-2 text-white">
                  <Sparkles size={15} className="shrink-0 text-yellow-400" />
                  Food spending increased by 20%
                </p>

                <p className="text-[#8B949E]">₹1,890 spent on food</p>
                <p className="text-[#8B949E]">₹620 less spent on shopping</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}