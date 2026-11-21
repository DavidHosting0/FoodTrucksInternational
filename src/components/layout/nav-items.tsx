"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FileImage,
  FileText,
  LayoutDashboard,
  Lightbulb,
  List,
  PlusCircle,
  Repeat,
  Settings,
  Tags,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { MORE_NAV_ITEMS, SPACE_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  List,
  PlusCircle,
  FileImage,
  Tags,
  Wallet,
  Lightbulb,
  Repeat,
  TrendingDown,
  FileText,
  Settings,
} as const;

function tabActive(pathname: string, search: string, space: string) {
  if (pathname !== "/dashboard") return false;
  const params = new URLSearchParams(search);
  const current = params.get("tab") ?? params.get("space") ?? "home";
  const aliases: Record<string, string> = {
    overview: "home",
    activity: "list",
    budget: "tips",
    budgets: "tips",
  };
  return (aliases[current] ?? current) === space;
}

export function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return (
    <nav className="flex flex-col gap-4 px-3">
      <div className="space-y-1">
        <p className="px-4 pb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Tabs
        </p>
        {SPACE_NAV_ITEMS.map((item) => {
          const active = tabActive(pathname, search, item.space);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "metal-chrome"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="space-y-1">
        <p className="px-4 pb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Mehr
        </p>
        {MORE_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
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
      </div>
    </nav>
  );
}
