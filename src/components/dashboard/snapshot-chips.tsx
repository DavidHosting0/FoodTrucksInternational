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
    <section className="animate-hero-in grid grid-cols-3 gap-2 [animation-delay:120ms]">
      <Link
        href="/budgets"
        className="metal-surface rounded-3xl px-3 py-3.5 transition-transform active:scale-[0.98]"
      >
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Budget
        </p>
        <p className="mt-1.5 text-xl font-semibold tabular-nums text-primary sm:text-2xl">
          {budgetPct === null ? "—" : `${budgetPct}%`}
        </p>
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
          {budgetTotal > 0
            ? `${formatMoney(budgetSpent, currency)} / ${formatMoney(budgetTotal, currency)}`
            : "Noch keins"}
        </p>
      </Link>
      <Link
        href="/subscriptions"
        className="metal-surface rounded-3xl px-3 py-3.5 transition-transform active:scale-[0.98]"
      >
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Abos / Jahr
        </p>
        <p className="mt-1.5 text-xl font-semibold tabular-nums sm:text-2xl">
          {formatMoney(subYearly, currency)}
        </p>
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          {activeSubs} aktiv
        </p>
      </Link>
      <Link
        href="/dashboard?tab=tips"
        className="metal-surface rounded-3xl px-3 py-3.5 transition-transform active:scale-[0.98]"
      >
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          AI Tipps
        </p>
        <p className="mt-1.5 text-xl font-semibold text-primary sm:text-2xl">
          Tipps
        </p>
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          Ausgaben prüfen
        </p>
      </Link>
    </section>
  );
}
