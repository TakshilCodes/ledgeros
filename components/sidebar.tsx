"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Repeat,
  Settings,
  Wallet,
} from "lucide-react";

import logo from "@/public/ledgerOS.png";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/dashboard/expenses", icon: ReceiptText },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { label: "Recurring", href: "/dashboard/recurring", icon: Repeat },
  { label: "Budgets", href: "/dashboard/budgets", icon: Wallet },
  { label: "Insights", href: "/dashboard/insights", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const accountName = session.data?.user?.name || "LedgerOS User";
  const accountEmail = session.data?.user?.email || "Account settings";
  const accountInitial = accountName.charAt(0).toUpperCase();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  const itemClass = (active: boolean) =>
    `group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-180 focus-visible:outline-none ${
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
        : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
    }`;

  return (
    <aside
      aria-label="Primary navigation"
      className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 md:flex"
    >
      <div className="mb-6 flex h-10 items-center justify-between px-2">
        <Link href="/dashboard" aria-label="LedgerOS dashboard">
          <Image src={logo} alt="LedgerOS" className="w-36 rounded-lg" priority />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href} className={itemClass(active)}>
              <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-1 rounded-lg bg-sidebar-accent/45 p-1">
          <Link
            href="/dashboard/settings"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-sidebar-accent"
            aria-label="Open account settings"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-green-400">
              {accountInitial}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {accountName}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {accountEmail}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );
}
