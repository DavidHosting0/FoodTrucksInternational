import Link from "next/link";
import { Pencil } from "lucide-react";
import type { TransactionWithCategory } from "@/types/database";
import { formatDate, formatMoney } from "@/lib/format";
import { NECESSITY_OPTIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteTransactionButton } from "@/components/transactions/delete-transaction-button";
import { cn } from "@/lib/utils";

function necessityLabel(value: string | null) {
  if (!value) return null;
  return NECESSITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function initial(merchant: string) {
  return merchant.trim().charAt(0).toUpperCase() || "?";
}

export function TransactionsTable({
  transactions,
}: {
  transactions: TransactionWithCategory[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl bg-card px-6 py-16 text-center">
        <p className="text-lg font-semibold">Noch keine Transaktionen</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Erfasse deine erste Ausgabe.
        </p>
        <Link
          href="/transactions/new"
          className={cn(buttonVariants(), "mt-5 inline-flex")}
        >
          Ausgabe erfassen
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 rounded-3xl bg-card px-3 py-3.5"
          >
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
              style={{
                backgroundColor: tx.categories?.color ?? "var(--primary)",
              }}
            >
              {initial(tx.merchant)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-tight">{tx.merchant}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {formatDate(tx.date)}
                {tx.categories?.name ? ` · ${tx.categories.name}` : ""}
              </p>
              {tx.split_data ? (
                <p className="mt-0.5 text-[11px] text-primary">
                  C {formatMoney(tx.split_data.totals.Carlo, tx.currency)} · D{" "}
                  {formatMoney(tx.split_data.totals.David, tx.currency)}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold tabular-nums text-expense">
                −{formatMoney(Number(tx.amount), tx.currency)}
              </p>
              <div className="mt-1 flex justify-end gap-0.5">
                <Link
                  href={`/transactions/${tx.id}/edit`}
                  aria-label="Bearbeiten"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" })
                  )}
                >
                  <Pencil className="size-3.5" />
                </Link>
                <DeleteTransactionButton id={tx.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Datum</TableHead>
              <TableHead>Händler</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead className="hidden lg:table-cell">Notwendigkeit</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead className="w-24 text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="border-white/5">
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
                      style={{
                        backgroundColor: tx.categories?.color ?? "var(--primary)",
                      }}
                    >
                      {initial(tx.merchant)}
                    </div>
                    <div>
                      <div className="font-medium">{tx.merchant}</div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {tx.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{tx.categories?.name ?? "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {tx.necessity ? (
                    <Badge variant="secondary">
                      {necessityLabel(tx.necessity)}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-expense">
                  −{formatMoney(Number(tx.amount), tx.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center">
                    <Link
                      href={`/transactions/${tx.id}/edit`}
                      aria-label="Bearbeiten"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" })
                      )}
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteTransactionButton id={tx.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
