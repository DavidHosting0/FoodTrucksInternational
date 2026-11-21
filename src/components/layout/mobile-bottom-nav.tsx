"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  PlusCircle,
  Settings,
  Wallet,
} from "lucide-react";
import { MOBILE_TAB_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  List,
  PlusCircle,
  Wallet,
  Settings,
} as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur lg:hidden pb-safe"
      aria-label="Hauptnavigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {MOBILE_TAB_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
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
                className="-mt-4 flex flex-col items-center justify-end pb-2"
                aria-label="Ausgabe erfassen"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Icon className="size-7" />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
