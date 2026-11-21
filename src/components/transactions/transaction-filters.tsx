"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Category } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base sm:h-9 sm:text-sm",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
  "dark:bg-input/30"
);

export function TransactionFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const hasFilters = Boolean(
    searchParams.get("q") ||
      searchParams.get("category") ||
      searchParams.get("from") ||
      searchParams.get("to")
  );
  const [open, setOpen] = useState(hasFilters);

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    const q = String(formData.get("q") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const from = String(formData.get("from") ?? "");
    const to = String(formData.get("to") ?? "");

    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    startTransition(() => {
      router.push(`/transactions?${params.toString()}`);
    });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/40">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium md:hidden"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          Filter {hasFilters ? "(aktiv)" : ""}
        </span>
        <span className="text-muted-foreground">{open ? "Schließen" : "Öffnen"}</span>
      </button>

      <form
        action={apply}
        className={cn(
          "grid gap-3 p-4 md:grid-cols-5",
          open ? "grid" : "hidden md:grid"
        )}
      >
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="q">Suche</Label>
          <Input
            id="q"
            name="q"
            placeholder="Händler, Beschreibung…"
            defaultValue={searchParams.get("q") ?? ""}
            className="h-11 text-base sm:h-9 sm:text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Kategorie</Label>
          <select
            id="category"
            name="category"
            defaultValue={searchParams.get("category") ?? ""}
            className={selectClass}
          >
            <option value="">Alle</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from">Von</Label>
          <Input
            id="from"
            name="from"
            type="date"
            defaultValue={searchParams.get("from") ?? ""}
            className="h-11 text-base sm:h-9 sm:text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Bis</Label>
          <Input
            id="to"
            name="to"
            type="date"
            defaultValue={searchParams.get("to") ?? ""}
            className="h-11 text-base sm:h-9 sm:text-sm"
          />
        </div>
        <div className="flex items-end gap-2 md:col-span-5">
          <Button type="submit" disabled={pending} className="h-11 sm:h-9">
            {pending ? "Filter…" : "Filtern"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 sm:h-9"
            onClick={() => startTransition(() => router.push("/transactions"))}
          >
            Zurücksetzen
          </Button>
        </div>
      </form>
    </div>
  );
}
