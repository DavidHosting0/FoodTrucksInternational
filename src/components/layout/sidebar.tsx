"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { FigBrandMark } from "@/components/brand/fig-logo";
import { NavItems } from "@/components/layout/nav-items";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  return (
    <aside className="hidden h-svh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center px-4 pt-2">
        <FigBrandMark />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <Suspense fallback={null}>
          <NavItems />
        </Suspense>
      </div>
      <div className="p-4">
        <SignOutButton />
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <div className="flex h-14 items-center justify-between px-4 pt-safe lg:hidden">
      <Link href="/dashboard" aria-label="Home">
        <FigBrandMark showTagline={false} />
      </Link>
      <Link
        href="/settings"
        aria-label="Einstellungen"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-full metal-surface"
        )}
      >
        <Settings className="size-5" />
      </Link>
    </div>
  );
}
