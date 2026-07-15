"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LogIn, Menu, X } from "lucide-react";

export function MobileLandingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative sm:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-landing-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-[#30363D] bg-[#0D1117]/90 text-[#C9D1D9] shadow-sm transition duration-200 hover:border-[#484F58] hover:bg-[#161B22] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB950]/55"
      >
        {isOpen ? <X className="size-[18px]" aria-hidden="true" /> : <Menu className="size-[18px]" aria-hidden="true" />}
      </button>

      <div
        id="mobile-landing-navigation"
        className={`absolute right-0 top-[calc(100%+0.65rem)] w-[min(18rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-[#30363D] bg-[#0D1117]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl transition duration-200 ${
          isOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <div className="px-3 pb-2 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6E7681]">LedgerOS</p>
          <p className="mt-1 text-sm text-[#8B949E]">Your financial picture, kept clear.</p>
        </div>

        <div className="my-1 h-px bg-[#21262D]" />

        <Link
          href="/signin"
          onClick={() => setIsOpen(false)}
          className="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#C9D1D9] transition-colors duration-200 hover:bg-[#161B22] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#58A6FF]/50"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#161B22] text-[#8B949E] transition-colors group-hover:text-white">
            <LogIn className="size-4" aria-hidden="true" />
          </span>
          Sign in
        </Link>

        <Link
          href="/signup"
          onClick={() => setIsOpen(false)}
          className="group mt-1 flex min-h-11 items-center gap-3 rounded-xl bg-[#2EA043] px-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#238636] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB950]/60"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="flex-1">Get started</span>
          <span className="text-[11px] font-medium text-white/65">Free</span>
        </Link>
      </div>
    </div>
  );
}