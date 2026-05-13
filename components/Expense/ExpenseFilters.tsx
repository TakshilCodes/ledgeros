"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, CalendarDays, ArrowUpDown, X } from "lucide-react";
import Link from "next/link";

export default function ExpenseFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const hasFilters =
        searchParams.get("search") ||
        searchParams.get("category") ||
        searchParams.get("date") ||
        searchParams.get("sort");

    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (!value || value === "ALL" || value === "all") {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        router.replace(`${pathname}?${params.toString()}`);
        router.refresh();
    }

    return (
        <section className="rounded-xl border border-[#3D444D] bg-[#0D1117] p-3">
            <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_auto_auto_auto]">
                <div className="relative">
                    <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]"
                    />

                    <input
                        type="text"
                        defaultValue={searchParams.get("search") || ""}
                        onChange={(e) => updateParam("search", e.target.value)}
                        placeholder="Search expenses..."
                        className="h-10 w-full rounded-lg border border-[#3D444D] bg-[#010409] pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#238636]"
                    />
                </div>

                <div className="relative">
                    <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />

                    <select
                        defaultValue={searchParams.get("category") || "ALL"}
                        onChange={(e) => updateParam("category", e.target.value)}
                        className="h-10 cursor-pointer appearance-none rounded-lg border border-[#3D444D] bg-[#151B23] pl-9 pr-3 text-sm text-[#C9D1D9] outline-none transition hover:bg-[#1f2630]"
                    >
                        <option value="ALL">Category</option>
                        <option value="FOOD">Food</option>
                        <option value="TRAVEL">Travel</option>
                        <option value="SHOPPING">Shopping</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div className="relative">
                    <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />

                    <select
                        defaultValue={searchParams.get("date") || "all"}
                        onChange={(e) => updateParam("date", e.target.value)}
                        className="h-10 cursor-pointer appearance-none rounded-lg border border-[#3D444D] bg-[#151B23] pl-9 pr-3 text-sm text-[#C9D1D9] outline-none transition hover:bg-[#1f2630]"
                    >
                        <option value="all">Date</option>
                        <option value="today">Today</option>
                        <option value="this-month">This Month</option>
                    </select>
                </div>

                <div className="relative">
                    <ArrowUpDown size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />

                    <select
                        defaultValue={searchParams.get("sort") || "newest"}
                        onChange={(e) => updateParam("sort", e.target.value)}
                        className="h-10 cursor-pointer appearance-none rounded-lg border border-[#3D444D] bg-[#151B23] pl-9 pr-3 text-sm text-[#C9D1D9] outline-none transition hover:bg-[#1f2630]"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="highest">Highest</option>
                        <option value="lowest">Lowest</option>
                    </select>
                </div>

                {hasFilters && (
                    <Link
                        href="/dashboard/expenses"
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#3D444D] bg-[#151B23] px-3 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                        <X size={16} />
                        Remove Filters
                    </Link>
                )}
            </div>
        </section>
    );
}