"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  Repeat,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import logo from "@/public/ledgerOS.png";
import { useSidebarStore } from "@/store/sidebar-store";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Expenses",
    href: "/dashboard/expenses",
    icon: ReceiptText,
  },
  {
    label: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    label: "Recurring",
    href: "/dashboard/recurring",
    icon: Repeat,
  },
  {
    label: "Budgets",
    href: "/dashboard/budgets",
    icon: Wallet,
  },
  {
    label: "Insights",
    href: "/dashboard/insights",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { isOpen, onClose } = useSidebarStore();

  async function handleLogout() {
    await signOut({
      redirect: false,
    });

    router.push("/signin");
    router.refresh();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-70 flex-col border-r border-[#3D444D] bg-[#0D1117] px-3 py-4 transition-transform duration-300 ease-out md:translate-x-0 md:w-65 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        {/* Logo + Close */}
        <div className="mb-8 flex items-center justify-between md:justify-start md:px-2">
          <Link href="/dashboard" onClick={onClose}>
            <Image
              src={logo}
              alt="LedgerOS"
              className="w-42 rounded-2xl md:w-45"
              priority
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center cursor-pointer rounded-xl border border-[#3D444D] text-[#8B949E] transition hover:bg-[#151B23] hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                  active
                    ? "border border-[#3D444D] bg-[#151B23] text-white"
                    : "text-[#8B949E] hover:bg-[#151B23] hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
              pathname === "/dashboard/settings"
                ? "border border-[#3D444D] bg-[#151B23] text-white"
                : "text-[#8B949E] hover:bg-[#151B23] hover:text-white"
            }`}
          >
            <Settings size={20} />

            <span className="text-sm font-medium">Settings</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#3D444D] bg-[#151B23] px-3 py-3 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={20} />

            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}