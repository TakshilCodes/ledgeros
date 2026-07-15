"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  Repeat,
  Wallet,
} from "lucide-react";

const mobileNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/dashboard/expenses", icon: ReceiptText },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { label: "Recurring", href: "/dashboard/recurring", icon: Repeat },
  { label: "Budgets", href: "/dashboard/budgets", icon: Wallet },
  { label: "Insights", href: "/dashboard/insights", icon: BarChart3 },
] as const;

function getActiveIndex(pathname: string) {
  const index = mobileNavItems.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  return index;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const routeIndex = getActiveIndex(pathname);
  const [activeIndex, setActiveIndex] = useState(routeIndex);

  useEffect(() => {
    setActiveIndex(routeIndex);
  }, [routeIndex]);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden"
    >
      <div className="relative grid h-16 grid-cols-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 flex h-px items-center justify-center transition-transform duration-200 ease-out"
          style={{
            width: `${100 / mobileNavItems.length}%`,
            opacity: activeIndex >= 0 ? 1 : 0,
            transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
          }}
        >
          <span className="h-0.5 w-7 rounded-full bg-primary shadow-[0_0_12px_rgba(46,160,67,0.9)]" />
        </div>

        {mobileNavItems.map((item, index) => {
          const Icon = item.icon;
          const active = activeIndex === index;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              title={item.label}
              onClick={() => setActiveIndex(index)}
              className="group relative flex min-w-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
            >
              <Icon
                aria-hidden="true"
                strokeWidth={active ? 2 : 1.7}
                className={`size-[19px] transition-[color,transform] duration-200 ease-out ${
                  active
                    ? "-translate-y-0.5 scale-110 text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
