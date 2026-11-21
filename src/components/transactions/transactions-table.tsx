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

export function TransactionsTable({
  transactions,
}: {
  transactions: TransactionWithCategory[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 px-6 py-16 text-center">
        <p className="text-lg font-medium">Noch keine Transaktionen</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Erfasse deine erste Ausgabe, um das Dashboard zu füllen.
        </p>
        <Link
          href="/transactions/new"
          className={cn(buttonVariants(), "mt-4 inline-flex")}
        >
          Ausgabe erfassen
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="rounded-xl border border-border/60 bg-card/40 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-tight">{tx.merchant}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(tx.date)}
                  {tx.categories?.name ? ` · ${tx.categories.name}` : ""}
                </p>
                {tx.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {tx.description}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-base font-semibold tabular-nums">
                {formatMoney(Number(tx.amount), tx.currency)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              {tx.necessity ? (
                <Badge variant="secondary">
                  {necessityLabel(tx.necessity)}
                </Badge>
              ) : (
                <span />
              )}
              <div className="inline-flex items-center">
                <Link
                  href={`/transactions/${tx.id}/edit`}
                  aria-label="Bearbeiten"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-11"
                  )}
                >
                  <Pencil className="size-4" />
                </Link>
                <DeleteTransactionButton id={tx.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border/60 md:block">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableRow key={tx.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{tx.merchant}</div>
                  <div className="line-clamp-1 text-xs text-muted-foreground">
                    {tx.description}
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
                <TableCell className="text-right font-medium tabular-nums">
                  {formatMoney(Number(tx.amount), tx.currency)}
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
