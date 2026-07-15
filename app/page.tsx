import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  PiggyBank,
  ReceiptText,
  Repeat2,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  BudgetBar,
  BudgetVisual,
  CategoryVisual,
  HeroProductVisual,
  InsightsVisual,
  RecurringVisual,
  SubscriptionVisual,
  TrendChart,
} from "@/components/landing/product-visuals";
import { LandingMotion } from "@/components/landing/landing-motion";
import { MobileLandingMenu } from "@/components/landing/mobile-landing-menu";
import { authOptions } from "@/lib/auth";
import logo from "@/public/ledgerOS.png";
import styles from "./landing.module.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LedgerOS",
  alternateName: ["Ledger OS", "ledgeros", "LedgerOS by Takshil"],
  url: "https://ledgeros.takshil.in",
  description:
    "LedgerOS is a modern expense, subscription, budget, and recurring payment tracker.",
};

const workflow = [
  {
    number: "01",
    title: "Add expenses",
    description: "Capture the amount, category, date, and note.",
    icon: ReceiptText,
    preview: (
      <div className="flex items-center gap-2.5 rounded-lg bg-[#010409]/65 px-3 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#58A6FF]/10 text-[#58A6FF]">
          <ReceiptText className="size-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-[#F0F6FC]">Grocery order</p>
          <p className="text-[9px] text-[#8B949E]">Food · Today</p>
        </div>
        <span className="text-[10px] font-semibold text-white">₹860</span>
      </div>
    ),
  },
  {
    number: "02",
    title: "Track renewals",
    description: "See recurring costs before they are charged.",
    icon: CreditCard,
    preview: (
      <div className="rounded-lg bg-[#010409]/65 px-3 py-2.5">
        <div className="flex justify-between text-[10px]">
          <span className="text-[#F0F6FC]">Netflix</span>
          <span className="text-[#D29922]">9 days</span>
        </div>
        <p className="mt-1 text-[9px] text-[#8B949E]">₹199 · Monthly</p>
      </div>
    ),
  },
  {
    number: "03",
    title: "Set boundaries",
    description: "Give each category a clear spending limit.",
    icon: Target,
    preview: (
      <div className="rounded-lg bg-[#010409]/65 px-3 py-2.5">
        <BudgetBar label="Food budget" value="66%" percentage={66} />
      </div>
    ),
  },
  {
    number: "04",
    title: "Review insights",
    description: "Turn activity into a clear next decision.",
    icon: BarChart3,
    preview: (
      <div className="flex items-center gap-2.5 rounded-lg bg-[#58A6FF]/8 px-3 py-2.5">
        <TrendingUp className="size-3.5 text-[#58A6FF]" aria-hidden="true" />
        <p className="text-[10px] leading-4 text-[#C9D1D9]">Spending pace improved by 12%.</p>
      </div>
    ),
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/dashboard");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        data-landing-root
        className={`${styles.page} min-h-screen overflow-x-hidden bg-[#010409] text-[#F0F6FC] selection:bg-[#2EA043]/30`}
      >
        <LandingMotion />
        <header className="sticky top-0 z-50 border-b border-[#21262D]/90 bg-[#010409]/85 backdrop-blur-xl">
          <nav
            className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB950]/50"
            >
              <Image src={logo} alt="LedgerOS" className="h-9 w-auto rounded-lg" priority />
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/signin"
                className={`${styles.secondaryButton} inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-[#C9D1D9] transition-colors duration-200 hover:bg-[#161B22] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50 sm:px-4`}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={`${styles.primaryButton} inline-flex h-9 items-center justify-center rounded-lg bg-[#2EA043] px-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#238636] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB950]/60 sm:px-4`}
              >
                Get started
              </Link>
            </div>
            <MobileLandingMenu />
          </nav>
        </header>

        <section className="relative isolate">
          <div className={`${styles.heroGlow} pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(46,160,67,0.12),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(88,166,255,0.14),transparent_30%)]`} />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:px-8 lg:py-24">
            <div data-reveal className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8B949E]">
                <span className="size-2 rounded-full bg-[#3FB950] shadow-[0_0_12px_rgba(63,185,80,0.75)]" />
                Your money, made legible
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl lg:text-[64px]">
                See where your money goes—before it drifts.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#8B949E] sm:text-lg sm:leading-8">
                LedgerOS brings expenses, renewals, recurring payments, and budgets into one clear view—then turns them into useful insights.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className={`${styles.primaryButton} inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2EA043] px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#238636] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB950]/60`}
                >
                  Start tracking free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#how-it-works"
                  className={`${styles.secondaryButton} inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#30363D] bg-[#0D1117]/70 px-5 text-sm font-medium text-[#C9D1D9] transition-colors duration-200 hover:bg-[#161B22] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50`}
                >
                  See how it works
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#8B949E]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-[#3FB950]" aria-hidden="true" />
                  Private account
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <LockKeyhole className="size-3.5 text-[#58A6FF]" aria-hidden="true" />
                  Your data stays yours
                </span>
              </div>
            </div>
            <div data-reveal data-delay="1">
              <div className={styles.floatingVisual}>
                <HeroProductVisual />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#21262D] bg-[#0D1117]/35 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3FB950]">One financial view</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                  Notice the leaks. Set the limits. Keep moving.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[#8B949E] sm:text-base sm:leading-7 lg:justify-self-end">
                LedgerOS connects the small money moments that usually live in separate lists, reminders, and mental notes.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-12">
              <article data-reveal
                data-delay="1"
                className={`${styles.valueCard} group rounded-[20px] bg-[#0D1117] p-5 ring-1 ring-inset ring-[#30363D]/80 transition duration-200 hover:-translate-y-0.5 hover:ring-[#58A6FF]/35 sm:p-6 lg:col-span-7`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#D29922]/10 text-[#D29922]">
                      <BellRing className="size-4" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">Catch forgotten subscriptions</h3>
                    <p className="mt-1.5 max-w-lg text-sm leading-6 text-[#8B949E]">See renewal timing and monthly cost before another charge lands.</p>
                  </div>
                  <span className="hidden text-xs text-[#6E7681] sm:block">₹2,198 / month</span>
                </div>
                <SubscriptionVisual />
              </article>

              <article data-reveal
                data-delay="2"
                className={`${styles.valueCard} group rounded-[20px] bg-[#0D1117] p-5 ring-1 ring-inset ring-[#30363D]/80 transition duration-200 hover:-translate-y-0.5 hover:ring-[#58A6FF]/35 sm:p-6 lg:col-span-5`}>
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#58A6FF]/10 text-[#58A6FF]">
                  <BarChart3 className="size-4" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Understand every category</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#8B949E]">Turn a month of transactions into a useful spending map.</p>
                <CategoryVisual />
              </article>

              <article data-reveal
                data-delay="3"
                className={`${styles.valueCard} group rounded-[20px] bg-[#0D1117] p-5 ring-1 ring-inset ring-[#30363D]/80 transition duration-200 hover:-translate-y-0.5 hover:ring-[#3FB950]/35 sm:p-6 lg:col-span-5`}>
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#3FB950]/10 text-[#3FB950]">
                  <PiggyBank className="size-4" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Make budgets visible</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#8B949E]">Know what is safe, what needs attention, and what crossed the line.</p>
                <BudgetVisual />
              </article>

              <article data-reveal
                data-delay="4"
                className={`${styles.valueCard} group rounded-[20px] bg-[#0D1117] p-5 ring-1 ring-inset ring-[#30363D]/80 transition duration-200 hover:-translate-y-0.5 hover:ring-[#A371F7]/35 sm:p-6 lg:col-span-7`}>
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#A371F7]/10 text-[#BC8CFF]">
                    <Repeat2 className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Keep recurring payments predictable</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#8B949E]">Rent, bills, EMIs, insurance, and every repeating cost stay in view.</p>
                  </div>
                </div>
                <RecurringVisual />
              </article>
            </div>
          </div>
        </section>

        <section className="relative py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-72 bg-[radial-gradient(ellipse_at_center,rgba(88,166,255,0.09),transparent_65%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-16 lg:px-8">
            <div data-reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#58A6FF]">Insights that answer back</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Recording money is useful. Understanding it is better.</h2>
              <p className="mt-5 text-sm leading-7 text-[#8B949E] sm:text-base">See your pace, strongest categories, and budget health without translating a spreadsheet first.</p>
              <div className="mt-8 space-y-5">
                {[
                  ["Spot the pattern", "Compare daily pace and category mix."],
                  ["Read budget health", "Know when a limit is safe, close, or exceeded."],
                  ["Act on one clear insight", "Focus on the category that matters now."],
                ].map(([title, description], index) => (
                  <div key={title} className="flex gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#161B22] text-[10px] font-semibold text-[#58A6FF]">{index + 1}</span>
                    <div><h3 className="text-sm font-medium text-[#F0F6FC]">{title}</h3><p className="mt-1 text-xs leading-5 text-[#8B949E]">{description}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal data-delay="1">
              <InsightsVisual />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-[#21262D] bg-[#0D1117]/45 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3FB950]">A simple money loop</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">From transaction to better decision.</h2>
              <p className="mt-4 text-sm leading-6 text-[#8B949E] sm:text-base">Four connected steps keep your financial picture current.</p>
            </div>

            <div className="relative mt-12 overflow-hidden rounded-[22px] bg-[#0D1117] ring-1 ring-inset ring-[#30363D]/80">
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-linear-to-r from-[#3FB950]/20 via-[#58A6FF]/50 to-[#A371F7]/20 lg:block" />
              <div className="grid lg:grid-cols-4">
                {workflow.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <article
                      key={step.number}
                      data-reveal
                      data-delay={String(index + 1)}
                      className={`relative p-5 sm:p-6 ${index ? "border-t border-[#21262D] lg:border-l lg:border-t-0" : ""}`}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="flex size-8 items-center justify-center rounded-full bg-[#161B22] text-[10px] font-semibold text-[#58A6FF] ring-4 ring-[#0D1117]">{step.number}</span>
                        <Icon className="size-4 text-[#6E7681]" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 text-sm font-semibold text-[#F0F6FC]">{step.title}</h3>
                      <p className="mt-1.5 min-h-10 text-xs leading-5 text-[#8B949E]">{step.description}</p>
                      <div className="mt-4">{step.preview}</div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div
            data-reveal
            className={`${styles.ctaShell} relative mx-auto grid max-w-6xl gap-10 overflow-hidden rounded-[28px] border border-[#30363D] px-5 py-10 shadow-2xl shadow-black/25 sm:px-9 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-12 lg:py-14`}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#3FB950]/10 px-3 py-1.5 text-[11px] font-medium text-[#3FB950] ring-1 ring-inset ring-[#3FB950]/20">
                <span className="size-1.5 rounded-full bg-[#3FB950]" />
                Your next month can be clearer
              </div>
              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-[44px] lg:leading-[1.08]">
                Give every rupee a clearer story.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#8B949E] sm:text-base sm:leading-7">
                Start with today&apos;s expenses. LedgerOS will connect the budgets, renewals, and insights around them.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className={`${styles.primaryButton} inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2EA043] px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#238636] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB950]/60`}
                >
                  Create your account
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/signin"
                  className={`${styles.secondaryButton} inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#30363D] bg-[#010409]/45 px-5 text-sm font-medium text-[#C9D1D9] transition-colors duration-200 hover:bg-[#161B22] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50`}
                >
                  Sign in
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-[#6E7681]">
                <LockKeyhole className="size-3" aria-hidden="true" />
                Private by default. No financial data is shared.
              </p>
            </div>

            <div className={`${styles.ctaPreview} relative z-10 rounded-[20px] border border-[#30363D] bg-[#010409]/75 p-4 sm:p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#F0F6FC]">Your monthly command view</p>
                  <p className="mt-0.5 text-[10px] text-[#8B949E]">Ready from your first expense</p>
                </div>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#3FB950]/10 text-[#3FB950]">
                  <Check className="size-4" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#161B22] px-3 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-[#8B949E]">Tracked</p>
                  <p className="mt-1 text-lg font-semibold text-white tabular-nums">₹20,534</p>
                </div>
                <div className="rounded-xl bg-[#161B22] px-3 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-[#8B949E]">Budget health</p>
                  <p className="mt-1 text-lg font-semibold text-[#3FB950]">Healthy</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-[#161B22]/70 px-3 pb-2.5 pt-3">
                <div className="mb-2 flex items-center justify-between text-[10px]"><span className="text-[#8B949E]">Spending pace</span><span className="text-[#3FB950]">12% under</span></div>
                <TrendChart compact />
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {["Renewals watched", "Budgets visible", "Insights ready"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-[9px] text-[#8B949E]">
                    <Check className="size-3 shrink-0 text-[#3FB950]" aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#21262D] px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-[#8B949E] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src={logo} alt="" className="h-7 w-auto rounded-md opacity-80" />
              <p>© {new Date().getFullYear()} LedgerOS. Built by Takshil.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/signin" className="transition-colors hover:text-white">Sign in</Link>
              <Link href="/signup" className="transition-colors hover:text-white">Create account</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}