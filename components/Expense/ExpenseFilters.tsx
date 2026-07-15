"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, CalendarDays, Filter, Search, X } from "lucide-react";

import { FilterBar } from "@/components/ui/foundation";
import { ResponsiveFilterControls } from "@/components/ui/responsive-filter-controls";
import { SelectField } from "@/components/ui/select";

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
    <FilterBar className="p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_minmax(150px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)_auto]">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
          />

          <input
            type="text"
            aria-label="Search expenses"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search expenses..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-white outline-none placeholder:text-muted-foreground/70 focus:border-primary/70"
          />
        </div>

        <ResponsiveFilterControls
          hasActiveFilters={
            category !== "ALL" || date !== "all" || sort !== "newest"
          }
        >
          <div className="relative">
            <Filter
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            />

            <SelectField
              ariaLabel="Filter by category"
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                updateParam("category", value);
              }}
              options={[
                { value: "ALL", label: "All categories" },
                { value: "FOOD", label: "Food" },
                { value: "TRAVEL", label: "Travel" },
                { value: "SHOPPING", label: "Shopping" },
                { value: "SUBSCRIPTION", label: "Subscription" },
                { value: "OTHER", label: "Other" },
              ]}
              className="h-10 w-full pl-9"
            />
          </div>

          <div className="relative">
            <CalendarDays
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            />

            <SelectField
              ariaLabel="Filter by date"
              value={date}
              onValueChange={(value) => {
                setDate(value);
                updateParam("date", value);
              }}
              options={[
                { value: "all", label: "All dates" },
                { value: "today", label: "Today" },
                { value: "this-month", label: "This month" },
              ]}
              className="h-10 w-full pl-9"
            />
          </div>

          <div className="relative">
            <ArrowUpDown
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            />

            <SelectField
              ariaLabel="Sort expenses"
              value={sort}
              onValueChange={(value) => {
                setSort(value);
                updateParam("sort", value);
              }}
              options={[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "highest", label: "Highest" },
                { value: "lowest", label: "Lowest" },
              ]}
              className="h-10 w-full pl-9"
            />
          </div>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              disabled={isPending}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-muted px-4 text-sm text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={15} aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </ResponsiveFilterControls>
      </div>
    </FilterBar>
  );
}