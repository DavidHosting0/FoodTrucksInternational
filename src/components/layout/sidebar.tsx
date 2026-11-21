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
    <div className="flex items-center gap-3 px-2 py-1">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Wallet className="size-5" />
      </div>
      <div>
        <p className="text-base font-semibold leading-none tracking-tight">
          Expense
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Personal finance</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-svh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center px-4 pt-2">
        <Brand />
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
      <Brand />
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
              <Brand />
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
