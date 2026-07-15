"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Plus, Settings, User } from "lucide-react";

import logo from "@/public/ledgerOS.png";
import { useExpenseModal } from "@/store/expense-modal-store";

function getPageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("/expenses")) return "Expenses";
  if (pathname.includes("/subscriptions")) return "Subscriptions";
  if (pathname.includes("/recurring")) return "Recurring";
  if (pathname.includes("/budgets")) return "Budgets";
  if (pathname.includes("/insights")) return "Insights";
  if (pathname.includes("/settings")) return "Settings";
  return "LedgerOS";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { onOpen: openExpenseModal } = useExpenseModal();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const showGlobalExpenseAction = pathname !== "/dashboard/expenses";

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-5 md:px-6 lg:px-8">
        <Link href="/dashboard" aria-label="LedgerOS dashboard" className="shrink-0 sm:hidden">
          <Image src={logo} alt="LedgerOS" priority className="h-auto w-28 rounded-md" />
        </Link>

        <h1 className="hidden truncate text-xl font-semibold tracking-tight text-foreground sm:block">
          {getPageTitle(pathname)}
        </h1>

        <div className="flex items-center gap-2">
          {showGlobalExpenseAction ? (
            <button
              type="button"
              onClick={openExpenseModal}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-green-500 focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 sm:px-4"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add expense</span>
            </button>
          ) : null}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex size-9 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground"
              aria-label="Open profile menu"
              aria-expanded={open}
              aria-haspopup="menu"
            >
              <User className="size-4" />
            </button>

            {open ? (
              <div role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl shadow-black/25">
                <Link
                  href="/dashboard/settings"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
