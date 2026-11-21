"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileImage,
  FileText,
  LayoutDashboard,
  List,
  PlusCircle,
  Repeat,
  Settings,
  Tags,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  List,
  PlusCircle,
  FileImage,
  Tags,
  Wallet,
  Repeat,
  TrendingDown,
  FileText,
  Settings,
} as const;

export function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.icon];
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href ||
              (item.href !== "/transactions/new" &&
                pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
