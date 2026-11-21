import Link from "next/link";
import { formatMoney } from "@/lib/format";

export function SnapshotChips({
  budgetPct,
  budgetSpent,
  budgetTotal,
  subYearly,
  currency,
  activeSubs,
}: {
  budgetPct: number | null;
  budgetSpent: number;
  budgetTotal: number;
  subYearly: number;
  currency: string;
  activeSubs: number;
}) {
  return (
    <section className="animate-hero-in flex gap-3 overflow-x-auto pb-1 [animation-delay:120ms] scrollbar-none">
      <Link
        href="/budgets"
        className="min-w-[9.5rem] shrink-0 rounded-3xl bg-card px-4 py-4 transition-transform active:scale-[0.98]"
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Budget
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">
          {budgetPct === null ? "—" : `${budgetPct}%`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {budgetTotal > 0
            ? `${formatMoney(budgetSpent, currency)} / ${formatMoney(budgetTotal, currency)}`
            : "Noch keins gesetzt"}
        </p>
      </Link>
      <Link
        href="/subscriptions"
        className="min-w-[9.5rem] shrink-0 rounded-3xl bg-card px-4 py-4 transition-transform active:scale-[0.98]"
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Abos / Jahr
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">
          {formatMoney(subYearly, currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {activeSubs} aktive Abos
        </p>
      </Link>
      <Link
        href="/optimization"
        className="min-w-[9.5rem] shrink-0 rounded-3xl bg-card px-4 py-4 transition-transform active:scale-[0.98]"
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Optimieren
        </p>
        <p className="mt-2 text-2xl font-semibold text-primary">Tipps</p>
        <p className="mt-1 text-xs text-muted-foreground">Sparpotenziale</p>
      </Link>
    </section>
  );
}
