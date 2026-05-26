import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  CreditCard,
  LineChart,
  Lock,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import logo from "@/public/ledgerOS.png";
import Image from "next/image";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LedgerOS",
  alternateName: ["Ledger OS", "ledgeros", "LedgerOS by Takshil"],
  url: "https://ledgeros.takshil.in",
  description:
    "LedgerOS is a modern expense, subscription, budget, and recurring payment tracker.",
};

const features = [
  {
    title: "Expense Tracking",
    description:
      "Record daily expenses with category, amount, date, notes, and clean history filters.",
    icon: ReceiptText,
  },
  {
    title: "Subscription Tracker",
    description:
      "Track active subscriptions, upcoming renewals, billing cycles, and monthly subscription cost.",
    icon: CreditCard,
  },
  {
    title: "Budget Management",
    description:
      "Create monthly, category, and daily limit budgets to control spending before it goes too far.",
    icon: PiggyBank,
  },
  {
    title: "Recurring Expenses",
    description:
      "Manage rent, EMI, bills, internet, insurance, education, and other repeating payments.",
    icon: CalendarClock,
  },
  {
    title: "Insights & Charts",
    description:
      "Understand your spending with simple charts, category breakdowns, and finance summaries.",
    icon: BarChart3,
  },
  {
    title: "No-Spend Progress",
    description:
      "Track no-spend days and build better spending habits with a simple visual streak system.",
    icon: Sparkles,
  },
];

const stats = [
  {
    label: "Track expenses",
    value: "Daily",
  },
  {
    label: "Manage renewals",
    value: "Smartly",
  },
  {
    label: "Review budgets",
    value: "Monthly",
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <main className="min-h-screen overflow-x-hidden bg-[#010409] text-white">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-[#3D444D]/70 bg-[#010409]/85 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logo}
                alt="LedgerOS"
                className="h-10 w-auto rounded-xl"
                priority
              />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="rounded-xl border border-[#3D444D] bg-[#0D1117] px-4 py-2 text-sm font-semibold text-[#C9D1D9] transition hover:bg-[#151B23] hover:text-white"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-[#2ea043] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#238636]"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(88,166,255,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(46,160,67,0.14),transparent_30%)]" />

          <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#3D444D] bg-[#0D1117] px-4 py-2 text-sm text-[#8B949E]">
                <ShieldCheck size={16} className="text-[#3FB950]" />
                Personal finance dashboard for better spending control
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Track expenses, subscriptions, budgets, and recurring payments
                in one place.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-[#8B949E] sm:text-lg">
                LedgerOS helps you understand where your money goes, catch
                forgotten subscriptions, manage budgets, and review financial
                insights from a clean GitHub-inspired dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-[#2ea043] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#238636]"
                >
                  Start using LedgerOS
                </Link>

                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center rounded-xl border border-[#3D444D] bg-[#0D1117] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#151B23]"
                >
                  Sign in to your account
                </Link>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#3D444D] bg-[#0D1117]/80 p-4"
                  >
                    <p className="text-xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-[#8B949E]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual without screenshot */}
            <div className="rounded-[2rem] border border-[#3D444D] bg-[#0D1117]/80 p-4 shadow-2xl shadow-black/40">
              <div className="rounded-[1.5rem] border border-[#3D444D] bg-[#010409] p-4">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#58A6FF]">
                      LedgerOS
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-white">
                      Monthly Overview
                    </h2>
                  </div>

                  <div className="rounded-full border border-[#3D444D] bg-[#151B23] px-3 py-1 text-xs text-[#C9D1D9]">
                    This month
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151B23] text-[#58A6FF]">
                      <Wallet size={17} />
                    </div>
                    <p className="mt-4 text-xs text-[#8B949E]">
                      Monthly Spend
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      ₹24,800
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151B23] text-[#3FB950]">
                      <PiggyBank size={17} />
                    </div>
                    <p className="mt-4 text-xs text-[#8B949E]">Budget Left</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      ₹12,200
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Spending Health
                      </h3>
                      <p className="mt-1 text-xs text-[#8B949E]">
                        Budget usage this month
                      </p>
                    </div>
                    <LineChart size={18} className="text-[#58A6FF]" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-[#8B949E]">Food</span>
                        <span className="text-white">64%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                        <div className="h-full w-[64%] rounded-full bg-[#58A6FF]" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-[#8B949E]">Subscriptions</span>
                        <span className="text-white">38%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                        <div className="h-full w-[38%] rounded-full bg-[#3FB950]" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-[#8B949E]">Shopping</span>
                        <span className="text-white">82%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                        <div className="h-full w-[82%] rounded-full bg-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#238636]/30 bg-[#238636]/10 p-4">
                  <p className="text-sm font-semibold text-[#3FB950]">
                    You are on track this month.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#8B949E]">
                    Keep your recurring expenses and subscriptions under review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-[#3D444D]/70 bg-[#010409] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#58A6FF]">
                Features
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you need to control spending.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#8B949E]">
                LedgerOS combines expense tracking, subscription tracking,
                recurring payments, budgets, charts, and insights into one
                clean personal finance app.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5 transition hover:border-[#58A6FF]/50 hover:bg-[#151B23]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#151B23] text-[#58A6FF]">
                      <Icon size={18} />
                    </div>

                    <h3 className="mt-5 text-base font-bold text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#8B949E]">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="border-t border-[#3D444D]/70 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3FB950]">
                Why LedgerOS
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Small spending leaks become big problems.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#8B949E]">
                Most people do not lose money in one big mistake. They lose it
                through daily spending, forgotten renewals, unmanaged budgets,
                and recurring payments they stopped noticing.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                <h3 className="text-base font-bold text-white">
                  Catch forgotten subscriptions
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#8B949E]">
                  See active subscriptions, monthly cost, billing cycle, and
                  upcoming renewal dates before they surprise you.
                </p>
              </div>

              <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                <h3 className="text-base font-bold text-white">
                  Make budgeting visual
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#8B949E]">
                  Compare budget limits with real spending and quickly spot
                  categories where you are overspending.
                </p>
              </div>

              <div className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-5">
                <h3 className="text-base font-bold text-white">
                  Review your money clearly
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#8B949E]">
                  Use summaries, charts, recent expenses, and insights to
                  understand your financial habits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#3D444D]/70 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#58A6FF]">
              Start tracking
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bring your expenses, subscriptions, budgets, and insights into
              one dashboard.
            </h2>

            <p className="mt-4 text-base leading-7 text-[#8B949E]">
              Create your LedgerOS account and start managing your personal
              finances with a clean, focused, app-like dashboard.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-[#2ea043] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#238636]"
              >
                Create account
              </Link>

              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-xl border border-[#3D444D] bg-[#0D1117] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#151B23]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#3D444D]/70 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-[#8B949E] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} LedgerOS. Built by Takshil.</p>

            <div className="flex gap-4">
              <Link href="/signin" className="hover:text-white">
                Sign in
              </Link>
              <Link href="/signup" className="hover:text-white">
                Sign up
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}