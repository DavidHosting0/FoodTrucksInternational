"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Plus,
  Settings,
  Wallet,
} from "lucide-react";
import { MOBILE_TAB_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  List,
  PlusCircle: Plus,
  Wallet,
  Settings,
} as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe lg:hidden"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto mb-2 flex h-[4.25rem] max-w-lg items-stretch justify-around rounded-[1.75rem] bg-[#121814]/95 px-1 shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-xl">
        {MOBILE_TAB_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Plus;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href ||
                (item.href !== "/transactions/new" &&
                  pathname.startsWith(item.href));
          const primary = "primary" in item && item.primary;

          if (primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="-mt-5 flex flex-col items-center justify-end pb-2 transition-transform active:scale-95"
                aria-label="Ausgabe erfassen"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_oklch(0.78_0.2_145_/_0.35)]">
                  <Icon className="size-7" strokeWidth={2.5} />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn("size-5 transition-transform", active && "scale-110")}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
