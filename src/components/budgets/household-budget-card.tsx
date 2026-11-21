"use client";

import { useActionState } from "react";
import type { HouseholdBudget } from "@/types/database";
import {
  saveHouseholdBudgetAction,
  type ActionState,
} from "@/app/actions/household-budget";
import { CURRENCIES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};
const selectClass =
  "flex h-12 w-full rounded-2xl border-0 bg-secondary px-4 text-base outline-none sm:text-sm";

export function HouseholdBudgetCard({
  month,
  budget,
  spent,
  carlo,
  david,
}: {
  month: string;
  budget: HouseholdBudget | null;
  spent: number;
  carlo: number;
  david: number;
}) {
  const [state, action, pending] = useActionState(
    saveHouseholdBudgetAction,
    initial
  );
  const limit = budget ? Number(budget.amount) : 0;
  const currency = budget?.currency ?? "CHF";
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : null;

  return (
    <div className="space-y-4">
      <div className="metal-plate rounded-[1.75rem] px-5 py-6 text-white">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
          Gesamtbudget · {month}
        </p>
        <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
          {limit > 0 ? formatMoney(limit, currency) : "—"}
        </p>
        <p className="mt-2 text-sm text-white/75">
          Ausgegeben {formatMoney(spent, currency)}
          {pct !== null ? ` · ${pct}%` : ""}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#39ff87]"
            style={{ width: `${pct ?? 0}%` }}
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/20 px-3 py-3">
            <p className="text-[11px] text-white/65">Carlo</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatMoney(carlo, currency)}
            </p>
          </div>
          <div className="rounded-2xl bg-black/20 px-3 py-3">
            <p className="text-[11px] text-white/65">David</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatMoney(david, currency)}
            </p>
          </div>
        </div>
      </div>

      <form action={action} className="metal-surface space-y-3 rounded-3xl p-4">
        <input type="hidden" name="month" value={month} />
        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.success ? (
          <p className="text-sm text-primary">{state.success}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Monatsbudget (beide)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={budget?.amount ?? ""}
              placeholder="z.B. 4000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Währung</Label>
            <select
              id="currency"
              name="currency"
              defaultValue={currency}
              className={selectClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Speichert…" : "Budget speichern"}
        </Button>
      </form>
    </div>
  );
}
