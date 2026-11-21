"use client";

import { useActionState } from "react";
import type { Category, RecurringExpense } from "@/types/database";
import {
  createSubscriptionAction,
  deleteSubscriptionAction,
  type ActionState,
} from "@/app/actions/subscriptions";
import { CURRENCIES } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

function yearly(amount: number, interval: string) {
  if (interval === "monthly") return amount * 12;
  if (interval === "quarterly") return amount * 4;
  return amount;
}

export function SubscriptionsManager({
  categories,
  subscriptions,
}: {
  categories: Category[];
  subscriptions: (RecurringExpense & { categories?: Category | null })[];
}) {
  const [state, action, pending] = useActionState(
    createSubscriptionAction,
    initial
  );

  const totalYearly = subscriptions
    .filter((s) => s.is_active)
    .reduce((sum, s) => sum + yearly(Number(s.amount), s.interval), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <p className="text-sm text-muted-foreground">Aktive Abos / Jahr</p>
        <p className="text-2xl font-semibold tabular-nums">
          {formatMoney(totalYearly, subscriptions[0]?.currency ?? "CHF")}
        </p>
      </div>

      <form
        action={action}
        className="grid gap-3 rounded-xl border border-border/60 bg-card/40 p-4 md:grid-cols-2"
      >
        {state.error ? (
          <Alert variant="destructive" className="md:col-span-2">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="merchant">Name / Anbieter</Label>
          <Input id="merchant" name="merchant" required className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">Betrag</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Währung</Label>
          <select
            id="currency"
            name="currency"
            defaultValue="CHF"
            className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="interval">Intervall</Label>
          <select
            id="interval"
            name="interval"
            defaultValue="monthly"
            className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3"
          >
            <option value="monthly">Monatlich</option>
            <option value="quarterly">Vierteljährlich</option>
            <option value="yearly">Jährlich</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category_id">Kategorie</Label>
          <select
            id="category_id"
            name="category_id"
            defaultValue=""
            className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="next_payment_date">Nächste Zahlung</Label>
          <Input
            id="next_payment_date"
            name="next_payment_date"
            type="date"
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cancellation_notice_days">Kündigungsfrist (Tage)</Label>
          <Input
            id="cancellation_notice_days"
            name="cancellation_notice_days"
            type="number"
            min="0"
            className="h-11"
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending} className="h-11 w-full sm:w-auto">
            Abo hinzufügen
          </Button>
        </div>
      </form>

      <ul className="space-y-3">
        {subscriptions.map((sub) => (
          <li
            key={sub.id}
            className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{sub.merchant}</p>
                {!sub.is_active ? <Badge variant="secondary">inaktiv</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatMoney(Number(sub.amount), sub.currency)} · {sub.interval}
                {sub.categories?.name ? ` · ${sub.categories.name}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                ~{formatMoney(yearly(Number(sub.amount), sub.interval), sub.currency)}
                /Jahr
                {sub.next_payment_date
                  ? ` · nächste Zahlung ${formatDate(sub.next_payment_date)}`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => deleteSubscriptionAction(sub.id)}
            >
              Löschen
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
