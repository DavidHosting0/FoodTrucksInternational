"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Minus, Plus } from "lucide-react";
import type { Category, Transaction } from "@/types/database";
import {
  updateTransactionSplitAction,
  type ActionState,
} from "@/app/actions/transaction-split";
import {
  computeSplitTotals,
  roundMoney,
  type SplitData,
  type SplitItem,
} from "@/lib/validations/split";
import { CURRENCIES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { DeleteTransactionButton } from "@/components/transactions/delete-transaction-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: ActionState = {};

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
    return { ...item, assignments: { Carlo: clamped, David: other } };
  }
  return { ...item, assignments: { Carlo: other, David: clamped } };
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

function toSplitData(tx: Transaction): SplitData {
  if (tx.split_data) {
    return {
      ...tx.split_data,
      persons: ["Carlo", "David"],
      merchant_meta: {
        ...tx.split_data.merchant_meta,
        merchant: tx.split_data.merchant_meta.merchant || tx.merchant,
        currency: tx.split_data.merchant_meta.currency ?? tx.currency,
        total:
          tx.split_data.merchant_meta.total ??
          tx.split_data.totals.receipt ??
          Number(tx.amount),
      },
    };
  }
  return {
    persons: ["Carlo", "David"],
    merchant_meta: {
      merchant: tx.merchant,
      date: tx.date,
      currency: tx.currency,
      total: Number(tx.amount),
    },
    items: [],
    totals: {
      Carlo: Number(tx.amount),
      David: 0,
      receipt: Number(tx.amount),
    },
  };
}

export function TransactionDetail({
  transaction,
  categories,
}: {
  transaction: Transaction;
  categories: Category[];
}) {
  const bound = updateTransactionSplitAction.bind(null, transaction.id);
  const [state, action, pending] = useActionState(bound, initialState);
  const [metaOpen, setMetaOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [split, setSplit] = useState<SplitData>(() => toSplitData(transaction));
  const [categoryId, setCategoryId] = useState(transaction.category_id ?? "");

  const totals = useMemo(
    () =>
      computeSplitTotals(
        split.items,
        split.merchant_meta.total ?? split.totals.receipt
      ),
    [split]
  );

  const currency = split.merchant_meta.currency ?? transaction.currency;
  const hasItems = split.items.length > 0;

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
              .join(" · ") || transaction.date}
            {` · ${formatMoney(totals.receipt, currency)}`}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
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

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-semibold tracking-tight">Artikel</h2>
        {!hasItems ? (
          <p className="metal-surface rounded-3xl px-4 py-10 text-center text-sm text-muted-foreground">
            Keine Artikelpositionen — Aufteilung nur über Total möglich.
          </p>
        ) : (
          split.items.map((item) => (
            <article
              key={item.id}
              className="metal-surface space-y-3 rounded-3xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 font-semibold leading-snug">
                  {item.name}
                </p>
                <p className="shrink-0 text-lg font-semibold tabular-nums">
                  {formatMoney(item.line_total, currency)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.quantity}× {formatMoney(item.unit_price, currency)}
              </p>

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
                        <span className="w-6 text-center font-semibold tabular-nums">
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

      <div className="space-y-2">
        <Label htmlFor="category">Kategorie</Label>
        <select
          id="category"
          className={selectClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Keine</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.success ? (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : null}

      <form action={action} className="space-y-3">
        <input type="hidden" name="category_id" value={categoryId} />
        <input
          type="hidden"
          name="split_json"
          value={JSON.stringify({ ...split, totals })}
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Speichert…" : "Aufteilung speichern"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setMoreOpen((v) => !v)}
        className="flex w-full items-center justify-between px-1 text-sm text-muted-foreground"
      >
        <span>Weitere Optionen</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            moreOpen && "rotate-180"
          )}
        />
      </button>

      {moreOpen ? (
        <div className="metal-surface space-y-4 rounded-3xl p-4">
          <Link
            href={`/transactions/${transaction.id}/edit?full=1`}
            className="block text-sm font-medium text-primary"
          >
            Alle Felder bearbeiten
          </Link>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Beleg löschen</span>
            <DeleteTransactionButton id={transaction.id} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
