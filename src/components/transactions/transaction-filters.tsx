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
  "flex h-12 w-full rounded-2xl border border-transparent bg-secondary px-4 text-base outline-none sm:h-11 sm:text-sm",
  "focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/20"
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
    <div className="rounded-3xl bg-card">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium md:hidden"
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
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Bis</Label>
          <Input
            id="to"
            name="to"
            type="date"
            defaultValue={searchParams.get("to") ?? ""}
          />
        </div>
        <div className="flex items-end gap-2 md:col-span-5">
          <Button type="submit" disabled={pending}>
            {pending ? "Filter…" : "Filtern"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => startTransition(() => router.push("/transactions"))}
          >
            Zurücksetzen
          </Button>
        </div>
      </form>
    </div>
  );
}
