"use client";

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
    Search,
    BarChart3,
    Settings,
    LogOut,
} from "lucide-react";

import logo from "@/public/ledgerOS.png";
import shortLogo from "@/public/ledgeros-icon.png"

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
        label: "Search",
        href: "/dashboard/search",
        icon: Search,
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

    async function handleLogout() {
        await signOut({
            redirect: false,
        });

        router.push("/signin");
        router.refresh();
    }

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-22 flex-col border-r border-[#3D444D] bg-[#0D1117] px-3 py-4 md:w-65">

            {/* Logo */}
            <div className="mb-8 flex items-center justify-center md:justify-start md:px-2">

                {/* Mobile Logo */}
                <Image
                    src={shortLogo}
                    alt="LedgerOS"
                    className="block h-10 w-10 rounded-2xl md:hidden"
                    priority
                />

                {/* Desktop Logo */}
                <Image
                    src={logo}
                    alt="LedgerOS"
                    className="hidden w-45 rounded-2xl md:block"
                    priority
                />
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    const active =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center justify-center rounded-2xl px-3 py-3 transition md:justify-start md:gap-3 ${active
                                ? "border border-[#3D444D] bg-[#151B23] text-white"
                                : "text-[#8B949E] hover:bg-[#151B23] hover:text-white"
                                }`}
                        >
                            <Icon size={20} />

                            <span className="hidden text-sm font-medium md:block">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto flex flex-col gap-2">
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center justify-center rounded-2xl px-3 py-3 transition md:justify-start md:gap-3 ${pathname === "/dashboard/settings"
                        ? "border border-[#3D444D] bg-[#151B23] text-white"
                        : "text-[#8B949E] hover:bg-[#151B23] hover:text-white"
                        }`}
                >
                    <Settings size={20} />

                    <span className="hidden text-sm font-medium md:block">
                        Settings
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center rounded-2xl border border-[#3D444D] bg-[#151B23] px-3 py-3 text-red-400 transition hover:bg-red-500/10 hover:text-red-300 md:justify-start md:gap-3"
                >
                    <LogOut size={20} />

                    <span className="hidden text-sm font-medium md:block">
                        Log out
                    </span>
                </button>
            </div>
        </aside>
    );
}