"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import type { Category } from "@/types/database";
import { ReceiptCaptureFlow } from "@/components/receipts/receipt-capture-flow";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CameraExpenseFab({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Ausgabe per Kamera erfassen"
            className="metal-fab flex size-16 items-center justify-center rounded-full transition-transform active:scale-95"
          />
        }
      >
        <Camera className="size-7" strokeWidth={2.25} />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[94svh] gap-0 overflow-y-auto rounded-t-[1.75rem] border-0 bg-background pb-safe"
      >
        <SheetHeader className="px-1 pb-2 text-left">
          <SheetTitle>Ausgabe erfassen</SheetTitle>
        </SheetHeader>
        <div className="px-1 pb-6 pt-2">
          {open ? (
            <ReceiptCaptureFlow
              categories={categories}
              autoOpenCamera
              onDone={() => setOpen(false)}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
