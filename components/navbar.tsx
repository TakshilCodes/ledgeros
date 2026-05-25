"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

import {
  Plus,
  Search,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useExpenseModal } from "@/store/expense-modal-store";
import { useSidebarStore } from "@/store/sidebar-store";

function getPageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("/expenses")) return "Expenses";
  if (pathname.includes("/subscriptions")) return "Subscriptions";
  if (pathname.includes("/recurring")) return "Recurring";
  if (pathname.includes("/budgets")) return "Budgets";
  if (pathname.includes("/search")) return "Search";
  if (pathname.includes("/insights")) return "Insights";
  if (pathname.includes("/settings")) return "Settings";

  return "LedgerOS";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const title = getPageTitle(pathname);

  const [open, setOpen] = useState(false);

  const { onOpen: openExpenseModal } = useExpenseModal();
  const { onOpen: openSidebar } = useSidebarStore();

  const dropdownRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await signOut({
      redirect: false,
    });

    router.push("/signin");
    router.refresh();
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#3D444D] bg-[#010409]/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">

        {/* Left */}
        <div>
          <h1 className="text-xl font-semibold text-white md:text-2xl">
            {title}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Add Expense */}
          <button
            onClick={openExpenseModal}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#2ea043] px-3 text-sm font-semibold text-white transition hover:bg-[#238636] md:px-4"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">Add Expense</span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#3D444D] bg-[#0D1117] text-[#8B949E] transition hover:bg-[#151B23] hover:text-white"
            >
              <User size={18} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-[#3D444D] bg-[#0D1117] shadow-2xl">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-[#8B949E] transition hover:bg-[#151B23] hover:text-white"
                >
                  <Settings size={17} />
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={openSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer border border-[#3D444D] bg-[#0D1117] text-[#8B949E] transition hover:bg-[#151B23] hover:text-white md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}