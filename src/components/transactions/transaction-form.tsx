"use client";

import { useActionState, useState } from "react";
import type { Category, Transaction } from "@/types/database";
import {
  createTransaction,
  updateTransaction,
  type ActionState,
} from "@/app/actions/transactions";
import {
  CURRENCIES,
  NECESSITY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PURCHASE_TYPE_OPTIONS,
  SATISFACTION_OPTIONS,
} from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState: ActionState = {};

const selectClass = cn(
  "flex h-12 w-full rounded-2xl border border-transparent bg-secondary px-4 text-base transition-colors outline-none sm:text-sm",
  "focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/20"
);

type Props = {
  categories: Category[];
  transaction?: Transaction;
};

export function TransactionForm({ categories, transaction }: Props) {
  const isEdit = Boolean(transaction);
  const boundUpdate = updateTransaction.bind(null, transaction?.id ?? "");
  const action = isEdit ? boundUpdate : createTransaction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [recurring, setRecurring] = useState(transaction?.is_recurring ?? false);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Betrag *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={transaction?.amount ?? ""}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Währung *</Label>
          <select
            id="currency"
            name="currency"
            required
            defaultValue={transaction?.currency ?? "CHF"}
            className={selectClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Datum *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={transaction?.date ?? today}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category_id">Kategorie *</Label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={transaction?.category_id ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              Kategorie wählen
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="merchant">Händler / Empfänger *</Label>
          <Input
            id="merchant"
            name="merchant"
            required
            defaultValue={transaction?.merchant ?? ""}
            placeholder="z.B. Migros, SBB, Netflix"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Input
            id="description"
            name="description"
            defaultValue={transaction?.description ?? ""}
            placeholder="Optional – sonst wird der Händler verwendet"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="justification">Begründung</Label>
          <Textarea
            id="justification"
            name="justification"
            rows={3}
            defaultValue={transaction?.justification ?? ""}
            placeholder="Optional – warum wurde ausgegeben?"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Bewertung</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="necessity">Notwendigkeit</Label>
            <select
              id="necessity"
              name="necessity"
              defaultValue={transaction?.necessity ?? ""}
              className={selectClass}
            >
              <option value="">—</option>
              {NECESSITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchase_type">Kaufentscheidung</Label>
            <select
              id="purchase_type"
              name="purchase_type"
              defaultValue={transaction?.purchase_type ?? ""}
              className={selectClass}
            >
              <option value="">—</option>
              {PURCHASE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="satisfaction">Zufriedenheit</Label>
            <select
              id="satisfaction"
              name="satisfaction"
              defaultValue={transaction?.satisfaction ?? ""}
              className={selectClass}
            >
              <option value="">—</option>
              {SATISFACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Optionale Angaben
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subcategory">Unterkategorie</Label>
            <Input
              id="subcategory"
              name="subcategory"
              defaultValue={transaction?.subcategory ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_method">Zahlungsart</Label>
            <select
              id="payment_method"
              name="payment_method"
              defaultValue={transaction?.payment_method ?? ""}
              className={selectClass}
            >
              <option value="">—</option>
              {PAYMENT_METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Standort</Label>
            <Input
              id="location"
              name="location"
              defaultValue={transaction?.location ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scope">Geschäftlich / Privat</Label>
            <select
              id="scope"
              name="scope"
              defaultValue={transaction?.scope ?? "private"}
              className={selectClass}
            >
              <option value="private">Privat</option>
              <option value="business">Geschäftlich</option>
            </select>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="is_recurring"
              name="is_recurring"
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="size-4 rounded border border-input accent-primary"
            />
            <Label htmlFor="is_recurring">Wiederkehrende Ausgabe</Label>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={transaction?.notes ?? ""}
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-24 z-10 -mx-1 bg-background/90 p-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={pending}
            size="lg"
            className="w-full sm:w-auto"
          >
            {pending
              ? "Wird gespeichert…"
              : isEdit
                ? "Änderungen speichern"
                : "Ausgabe speichern"}
          </Button>
        </div>
      </div>
    </form>
  );
}
