"use client";

import { useState } from "react";
import { Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavItems } from "@/components/layout/nav-items";
import { SignOutButton } from "@/components/layout/sign-out-button";

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
        <Wallet className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-none">Expense Manager</p>
        <p className="text-xs text-muted-foreground">Personal Finance</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-svh w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center border-b border-border/60 px-3">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavItems />
      </div>
      <div className="border-t border-border/60 p-3">
        <SignOutButton />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-14 items-center justify-between border-b border-border/60 px-4 pt-safe lg:hidden">
      <Brand />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Menü öffnen" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
            <SheetTitle>
              <Brand />
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <NavItems onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-border/60 p-3">
            <SignOutButton />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
