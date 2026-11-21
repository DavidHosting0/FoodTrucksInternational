"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FigBrandMark } from "@/components/brand/fig-logo";
import { NavItems } from "@/components/layout/nav-items";
import { SignOutButton } from "@/components/layout/sign-out-button";

export function Sidebar() {
  return (
    <aside className="hidden h-svh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center px-4 pt-2">
        <FigBrandMark />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavItems />
      </div>
      <div className="p-4">
        <SignOutButton />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-14 items-center justify-between px-4 pt-safe lg:hidden">
      <FigBrandMark />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menü öffnen"
              className="rounded-full bg-secondary"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-80 border-0 bg-background p-0">
          <SheetHeader className="px-4 py-5 text-left">
            <SheetTitle>
              <FigBrandMark />
            </SheetTitle>
          </SheetHeader>
          <div className="py-2">
            <NavItems onNavigate={() => setOpen(false)} />
          </div>
          <div className="p-4">
            <SignOutButton />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
