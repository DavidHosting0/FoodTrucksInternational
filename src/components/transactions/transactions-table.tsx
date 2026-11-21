import Link from "next/link";
import type { TransactionWithCategory } from "@/types/database";
import { transactionPersonShare } from "@/lib/analytics/split";
import { formatDate, formatMoney } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <div className="metal-surface rounded-3xl px-6 py-16 text-center">
        <p className="text-lg font-semibold">Noch keine Transaktionen</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Erfasse deine erste Ausgabe.
        </p>
        <Link
          href="/dashboard?tab=capture"
          className={cn(buttonVariants(), "mt-5 inline-flex")}
        >
          Ausgabe erfassen
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {transactions.map((tx) => {
        const share = transactionPersonShare(tx);
        const tipCount = tx.ai_tips?.length ?? 0;
        const hasWaste = (tx.ai_tips ?? []).some(
          (tip) => tip.severity === "unnecessary" || tip.tip_severity === "waste"
        );
        return (
          <li key={tx.id}>
            <Link
              href={`/transactions/${tx.id}/edit`}
              className="metal-surface flex items-center gap-3 rounded-3xl px-3 py-3.5 transition-transform active:scale-[0.99]"
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
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-tight">
                      {tx.merchant}
                    </p>
                    {tipCount > 0 ? (
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          hasWaste
                            ? "bg-destructive/15 text-destructive"
                            : "bg-primary/15 text-primary"
                        )}
                      >
                        {tipCount === 1 ? "1 Tipp" : `${tipCount} Tipps`}
                      </span>
                    ) : tx.ai_tips_status === "pending" ? (
                      <span className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Bewertung…
                      </span>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-expense">
                    −{formatMoney(Number(tx.amount), tx.currency)}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {formatDate(tx.date)}
                  {tx.categories?.name ? ` · ${tx.categories.name}` : ""}
                </p>
                {share.hasSplit ? (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-primary">
                        Carlo {share.carloPct}%
                      </span>
                      <span className="text-muted-foreground">
                        David {share.davidPct}%
                      </span>
                    </div>
                    <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${share.carloPct ?? 0}%` }}
                      />
                      <div
                        className="h-full bg-white/35"
                        style={{ width: `${share.davidPct ?? 0}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Nicht aufgeteilt
                  </p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
