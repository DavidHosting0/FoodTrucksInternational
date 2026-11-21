"use client";

import { useActionState } from "react";
import type { Receipt, TransactionWithCategory } from "@/types/database";
import {
  deleteReceiptAction,
  linkReceiptAction,
  uploadReceiptAction,
  type ActionState,
} from "@/app/actions/receipts";
import { formatDate, formatMoney } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

export function ReceiptsManager({
  receipts,
  transactions,
}: {
  receipts: Receipt[];
  transactions: TransactionWithCategory[];
}) {
  const [state, action, pending] = useActionState(uploadReceiptAction, initial);

  return (
    <div className="space-y-6">
      <form
        action={action}
        className="space-y-3 rounded-3xl bg-card p-4"
      >
        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.success ? (
          <p className="text-sm text-primary">{state.success}</p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="file">Beleg fotografieren / hochladen</Label>
          <Input
            id="file"
            name="file"
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            required
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="transaction_id">Mit Transaktion verknüpfen</Label>
          <select
            id="transaction_id"
            name="transaction_id"
            defaultValue=""
            className="flex h-12 w-full rounded-2xl border-0 bg-secondary px-4 text-sm"
          >
            <option value="">Später verknüpfen</option>
            {transactions.slice(0, 50).map((tx) => (
              <option key={tx.id} value={tx.id}>
                {tx.date} · {tx.merchant} ·{" "}
                {formatMoney(Number(tx.amount), tx.currency)}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending} className="h-11 w-full sm:w-auto">
          Hochladen
        </Button>
      </form>

      <ul className="grid gap-3 sm:grid-cols-2">
        {receipts.length === 0 ? (
          <li className="rounded-3xl bg-card px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2">
            Noch keine Belege.
          </li>
        ) : (
          receipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              transactions={transactions}
            />
          ))
        )}
      </ul>
    </div>
  );
}

function ReceiptCard({
  receipt,
  transactions,
}: {
  receipt: Receipt;
  transactions: TransactionWithCategory[];
}) {
  const boundLink = linkReceiptAction.bind(null, receipt.id);
  const [state, action, pending] = useActionState(boundLink, initial);
  const linked = transactions.find((tx) => tx.id === receipt.transaction_id);
  const href = `/api/uploads/${receipt.file_path}`;
  const isImage = receipt.file_type.startsWith("image/");

  return (
    <li className="overflow-hidden rounded-3xl bg-card">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={href}
          alt={receipt.file_name}
          className="h-40 w-full object-cover bg-muted"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-muted text-sm text-muted-foreground">
          PDF / Datei
        </div>
      )}
      <div className="space-y-3 p-4">
        <div>
          <p className="truncate font-medium">{receipt.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(receipt.created_at.slice(0, 10))}
            {linked
              ? ` · ${linked.merchant}`
              : " · nicht verknüpft"}
          </p>
        </div>
        <form action={action} className="space-y-2">
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <select
            name="transaction_id"
            defaultValue={receipt.transaction_id ?? ""}
            className="flex h-12 w-full rounded-2xl border-0 bg-secondary px-4 text-sm"
          >
            <option value="">Keine Verknüpfung</option>
            {transactions.slice(0, 50).map((tx) => (
              <option key={tx.id} value={tx.id}>
                {tx.date} · {tx.merchant}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={pending} className="h-11 flex-1">
              Verknüpfen
            </Button>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-secondary text-sm"
            >
              Öffnen
            </a>
            <Button
              type="button"
              variant="ghost"
              className="h-11 text-destructive"
              onClick={() => deleteReceiptAction(receipt.id)}
            >
              Löschen
            </Button>
          </div>
        </form>
      </div>
    </li>
  );
}
