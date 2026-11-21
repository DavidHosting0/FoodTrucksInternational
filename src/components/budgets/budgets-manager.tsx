"use client";

import { useActionState } from "react";
import type { Budget, Category } from "@/types/database";
import {
  deleteBudgetAction,
  saveBudgetAction,
  type ActionState,
} from "@/app/actions/budgets";
import { CURRENCIES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initial: ActionState = {};

type BudgetWithSpend = Budget & {
  categories?: Category | null;
  spent: number;
};

export function BudgetsManager({
  categories,
  budgets,
  month,
}: {
  categories: Category[];
  budgets: BudgetWithSpend[];
  month: string;
}) {
  const [state, action, pending] = useActionState(saveBudgetAction, initial);

  return (
    <div className="space-y-6">
      <form
        action={action}
        className="grid gap-3 rounded-xl border border-border/60 bg-card/40 p-4 md:grid-cols-4"
      >
        <input type="hidden" name="month" value={month} />
        {state.error ? (
          <Alert variant="destructive" className="md:col-span-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.success ? (
          <p className="text-sm text-primary md:col-span-4">{state.success}</p>
        ) : null}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="category_id">Kategorie</Label>
          <select
            id="category_id"
            name="category_id"
            required
            className={cn(
              "flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base sm:text-sm"
            )}
            defaultValue=""
          >
            <option value="" disabled>
              Wählen…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">Budget</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
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
            className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base sm:text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <Button type="submit" disabled={pending} className="h-11 w-full sm:w-auto">
            Budget speichern
          </Button>
        </div>
      </form>

      <ul className="space-y-3">
        {budgets.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
            Noch keine Budgets für diesen Monat.
          </li>
        ) : (
          budgets.map((budget) => {
            const pct =
              budget.amount > 0
                ? Math.min(100, (budget.spent / Number(budget.amount)) * 100)
                : 0;
            const over = budget.spent > Number(budget.amount);
            return (
              <li
                key={budget.id}
                className="rounded-xl border border-border/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {budget.categories?.name ?? "Kategorie"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(budget.spent, budget.currency)} von{" "}
                      {formatMoney(Number(budget.amount), budget.currency)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteBudgetAction(budget.id)}
                  >
                    Löschen
                  </Button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      over ? "bg-destructive" : "bg-primary"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
