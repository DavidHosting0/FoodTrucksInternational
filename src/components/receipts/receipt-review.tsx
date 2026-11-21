"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import type { Category } from "@/types/database";
import {
  computeSplitTotals,
  lineTotal,
  roundMoney,
  type SplitData,
  type SplitItem,
} from "@/lib/validations/split";
import { CURRENCIES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { guessCategoryId } from "@/lib/receipts/guess-category";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "flex h-12 w-full rounded-2xl border border-transparent bg-secondary px-4 text-base transition-colors outline-none sm:text-sm",
  "focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/20"
);

function setAssignment(
  item: SplitItem,
  person: "Carlo" | "David",
  value: number
): SplitItem {
  const qty = item.quantity;
  const clamped = Math.max(0, Math.min(qty, value));
  const other = roundMoney(qty - clamped);
  if (person === "Carlo") {
    return {
      ...item,
      assignments: { Carlo: clamped, David: other },
    };
  }
  return {
    ...item,
    assignments: { Carlo: other, David: clamped },
  };
}

function assignAll(item: SplitItem, person: "Carlo" | "David"): SplitItem {
  if (person === "Carlo") {
    return { ...item, assignments: { Carlo: item.quantity, David: 0 } };
  }
  return { ...item, assignments: { Carlo: 0, David: item.quantity } };
}

function assignSplit(item: SplitItem): SplitItem {
  if (item.quantity === 1) {
    return { ...item, assignments: { Carlo: 0.5, David: 0.5 } };
  }
  const carlo = Math.floor(item.quantity / 2);
  return {
    ...item,
    assignments: { Carlo: carlo, David: item.quantity - carlo },
  };
}

export function ReceiptReview({
  initial,
  categories,
  previewUrl,
  scanId,
  error,
  pending,
  onSubmit,
}: {
  initial: SplitData;
  categories: Category[];
  previewUrl?: string;
  scanId: string;
  error?: string;
  pending?: boolean;
  onSubmit: (payload: {
    split: SplitData;
    categoryId: string | null;
    acceptMismatch: boolean;
  }) => void;
}) {
  const [metaOpen, setMetaOpen] = useState(false);
  const [split, setSplit] = useState<SplitData>(initial);
  const [categoryId, setCategoryId] = useState(
    () =>
      guessCategoryId(
        categories,
        initial.merchant_meta.merchant,
        initial.items.map((item) => item.name)
      ) ?? ""
  );
  const [acceptMismatch, setAcceptMismatch] = useState(false);

  const totals = useMemo(
    () =>
      computeSplitTotals(
        split.items,
        split.merchant_meta.total ?? split.totals.receipt
      ),
    [split]
  );

  const currency = split.merchant_meta.currency ?? "CHF";
  const mismatch =
    Math.abs(totals.Carlo + totals.David - totals.receipt) > 0.05;

  const updateMeta = (patch: Partial<SplitData["merchant_meta"]>) => {
    setSplit((prev) => ({
      ...prev,
      merchant_meta: { ...prev.merchant_meta, ...patch },
      totals: computeSplitTotals(
        prev.items,
        patch.total !== undefined
          ? patch.total
          : (prev.merchant_meta.total ?? prev.totals.receipt)
      ),
    }));
  };

  const updateItem = (id: string, next: SplitItem) => {
    setSplit((prev) => {
      const items = prev.items.map((item) => (item.id === id ? next : item));
      return {
        ...prev,
        items,
        totals: computeSplitTotals(
          items,
          prev.merchant_meta.total ?? prev.totals.receipt
        ),
      };
    });
  };

  return (
    <div className="space-y-5">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Beleg"
          className="metal-surface mx-auto max-h-40 w-full rounded-3xl object-contain p-2"
        />
      ) : null}

      <button
        type="button"
        onClick={() => setMetaOpen((v) => !v)}
        className="metal-surface flex w-full items-center justify-between rounded-3xl px-4 py-4 text-left"
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Händler & Zahlung
          </p>
          <p className="mt-1 text-lg font-semibold">
            {split.merchant_meta.merchant}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {[split.merchant_meta.date, split.merchant_meta.time]
              .filter(Boolean)
              .join(" · ") || "Datum unbekannt"}
            {split.merchant_meta.card_type
              ? ` · ${split.merchant_meta.card_type}`
              : ""}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground transition-transform",
            metaOpen && "rotate-180"
          )}
        />
      </button>

      {metaOpen ? (
        <div className="metal-surface space-y-4 rounded-3xl p-4">
          <div className="space-y-2">
            <Label htmlFor="merchant">Händler</Label>
            <Input
              id="merchant"
              value={split.merchant_meta.merchant}
              onChange={(e) => updateMeta({ merchant: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={split.merchant_meta.date ?? ""}
                onChange={(e) => updateMeta({ date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Uhrzeit</Label>
              <Input
                id="time"
                type="time"
                value={split.merchant_meta.time ?? ""}
                onChange={(e) => updateMeta({ time: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="card">Kartentyp</Label>
              <Input
                id="card"
                value={split.merchant_meta.card_type ?? ""}
                onChange={(e) => updateMeta({ card_type: e.target.value })}
                placeholder="Visa / TWINT / …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last4">Karten-Ende</Label>
              <Input
                id="last4"
                value={split.merchant_meta.payment_last4 ?? ""}
                onChange={(e) => updateMeta({ payment_last4: e.target.value })}
                placeholder="1234"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Währung</Label>
              <select
                id="currency"
                className={selectClass}
                value={currency}
                onChange={(e) =>
                  updateMeta({
                    currency: e.target.value as "CHF" | "EUR" | "USD",
                  })
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Belegtotal</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                min="0"
                value={split.merchant_meta.total ?? totals.receipt}
                onChange={(e) =>
                  updateMeta({ total: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-semibold tracking-tight">Artikel</h2>
        {split.items.length === 0 ? (
          <p className="metal-surface rounded-3xl px-4 py-10 text-center text-sm text-muted-foreground">
            Keine Positionen erkannt — Meta speichern oder neu scannen.
          </p>
        ) : (
          split.items.map((item) => (
            <article
              key={item.id}
              className="metal-surface space-y-3 rounded-3xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <Input
                  value={item.name}
                  className="text-base font-semibold"
                  onChange={(e) =>
                    updateItem(item.id, { ...item, name: e.target.value })
                  }
                />
                <p className="shrink-0 pt-2 text-lg font-semibold tabular-nums">
                  {formatMoney(item.line_total, currency)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Menge</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const quantity = Math.max(1, Number(e.target.value) || 1);
                      const next = {
                        ...item,
                        quantity,
                        line_total: lineTotal(quantity, item.unit_price),
                        assignments: {
                          Carlo: quantity,
                          David: 0,
                        },
                      };
                      updateItem(item.id, next);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Stückpreis</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => {
                      const unit_price = Number(e.target.value) || 0;
                      updateItem(item.id, {
                        ...item,
                        unit_price,
                        line_total: lineTotal(item.quantity, unit_price),
                      });
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    item.assignments.Carlo === item.quantity
                      ? "default"
                      : "secondary"
                  }
                  onClick={() => updateItem(item.id, assignAll(item, "Carlo"))}
                >
                  Carlo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    item.assignments.David === item.quantity
                      ? "default"
                      : "secondary"
                  }
                  onClick={() => updateItem(item.id, assignAll(item, "David"))}
                >
                  David
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    item.assignments.Carlo > 0 && item.assignments.David > 0
                      ? "default"
                      : "secondary"
                  }
                  onClick={() => updateItem(item.id, assignSplit(item))}
                >
                  Beide
                </Button>
              </div>

              {item.quantity > 1 ? (
                <div className="grid grid-cols-2 gap-3">
                  {(["Carlo", "David"] as const).map((person) => (
                    <div
                      key={person}
                      className="flex items-center justify-between rounded-2xl bg-secondary/70 px-3 py-2"
                    >
                      <span className="text-sm font-medium">{person}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex size-8 items-center justify-center rounded-full bg-background"
                          onClick={() =>
                            updateItem(
                              item.id,
                              setAssignment(
                                item,
                                person,
                                item.assignments[person] - 1
                              )
                            )
                          }
                          aria-label={`${person} weniger`}
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-6 text-center tabular-nums font-semibold">
                          {item.assignments[person]}
                        </span>
                        <button
                          type="button"
                          className="flex size-8 items-center justify-center rounded-full bg-background"
                          onClick={() =>
                            updateItem(
                              item.id,
                              setAssignment(
                                item,
                                person,
                                item.assignments[person] + 1
                              )
                            )
                          }
                          aria-label={`${person} mehr`}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>

      <section className="metal-plate space-y-3 rounded-3xl px-4 py-5 text-white">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
          Aufteilung
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-white/70">Carlo</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {formatMoney(totals.Carlo, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/70">David</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {formatMoney(totals.David, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/70">Beleg</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {formatMoney(totals.receipt, currency)}
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <Label htmlFor="category">Kategorie</Label>
        <select
          id="category"
          className={selectClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Keine / später</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {categoryId
            ? "Automatisch erkannt — bei Bedarf ändern."
            : "Nicht sicher erkannt — leer lassen ist ok."}
        </p>
      </div>

      {mismatch ? (
        <label className="metal-surface flex items-start gap-3 rounded-3xl p-4 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={acceptMismatch}
            onChange={(e) => setAcceptMismatch(e.target.checked)}
          />
          <span>
            Abweichung zwischen Anteils-Summe und Belegtotal akzeptieren und
            trotzdem speichern.
          </span>
        </label>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={pending || (mismatch && !acceptMismatch)}
        onClick={() =>
          onSubmit({
            split: {
              ...split,
              totals,
            },
            categoryId: categoryId || null,
            acceptMismatch,
          })
        }
      >
        {pending ? "Speichert…" : "Ausgabe speichern"}
      </Button>

      <input type="hidden" name="scanId" value={scanId} readOnly />
    </div>
  );
}
