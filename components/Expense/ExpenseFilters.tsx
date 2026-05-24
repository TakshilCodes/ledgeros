"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, CalendarDays, Filter, Search, X } from "lucide-react";

export default function ExpenseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );

  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [date, setDate] = useState(searchParams.get("date") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const isFirstRender = useRef(true);

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("category") ||
    searchParams.get("date") ||
    searchParams.get("sort");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "ALL" || value === "all" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function clearFilters() {
    setSearchValue("");
    setCategory("ALL");
    setDate("all");
    setSort("newest");

    startTransition(() => {
      router.replace(pathname);
    });
  }

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "ALL");
    setDate(searchParams.get("date") || "all");
    setSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      updateParam("search", searchValue);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  return (
    <section className="rounded-2xl border border-[#3D444D] bg-[#0D1117] p-4">
      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]"
          />

          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search expenses..."
            className="h-11 w-full rounded-xl border border-[#3D444D] bg-[#010409] pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#6E7681] focus:border-[#58A6FF]"
          />
        </div>

        <div className="relative">
          <Filter
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]"
          />

          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              updateParam("category", event.target.value);
            }}
            className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#3D444D] bg-[#010409] pl-9 pr-3 text-sm text-white outline-none focus:border-[#58A6FF]"
          >
            <option value="ALL">All Categories</option>
            <option value="FOOD">Food</option>
            <option value="TRAVEL">Travel</option>
            <option value="SHOPPING">Shopping</option>
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="relative">
          <CalendarDays
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]"
          />

          <select
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              updateParam("date", event.target.value);
            }}
            className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#3D444D] bg-[#010409] pl-9 pr-3 text-sm text-white outline-none focus:border-[#58A6FF]"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="this-month">This Month</option>
          </select>
        </div>

        <div className="relative">
          <ArrowUpDown
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7681]"
          />

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              updateParam("sort", event.target.value);
            }}
            className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#3D444D] bg-[#010409] pl-9 pr-3 text-sm text-white outline-none focus:border-[#58A6FF]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest</option>
            <option value="lowest">Lowest</option>
          </select>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#3D444D] bg-[#151B23] px-4 text-sm text-[#C9D1D9] transition hover:bg-[#21262D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={16} />
            Clear
          </button>
        ) : null}
      </div>
    </section>
  );
}