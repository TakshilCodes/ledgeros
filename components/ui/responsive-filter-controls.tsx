"use client";

import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ResponsiveFilterControls({
  children,
  hasActiveFilters = false,
  showLabel = false,
  fullWidth = false,
}: {
  children: ReactNode;
  hasActiveFilters?: boolean;
  showLabel?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <>
      <div className="hidden md:contents">{children}</div>

      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Open filters"
            className={cn(
              "relative inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-150 hover:border-border/90 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:hidden",
              showLabel ? "gap-2 px-3 text-sm font-medium" : "w-10",
              fullWidth &&
                "w-full border-transparent bg-transparent hover:border-transparent hover:bg-muted/50"
            )}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {showLabel ? <span>Filters</span> : null}
            {hasActiveFilters ? (
              <span
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary ring-2 ring-background"
              />
            ) : null}
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm">
          <DialogHeader className="border-b border-border/70 px-4 py-3.5 pr-12">
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription className="sr-only">
              Refine the items shown on this page.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2.5 p-4 [&>*]:w-full">{children}</div>

          <div className="flex justify-end border-t border-border/70 bg-muted/30 px-4 py-3">
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Done
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}