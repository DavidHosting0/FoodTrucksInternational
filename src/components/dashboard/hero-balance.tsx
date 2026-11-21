import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function HeroBalance({
  total,
  currency,
  delta,
  subtitle = "Ausgaben diesen Monat",
}: {
  total: number;
  currency: string;
  delta: number;
  subtitle?: string;
}) {
  const up = delta > 0;

  return (
    <section className="animate-hero-in px-1 pt-4 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {subtitle}
      </p>
      <p className="mt-3 text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
        {formatMoney(total, currency)}
      </p>
      {delta !== 0 ? (
        <p
          className={cn(
            "mt-3 text-sm font-medium tabular-nums",
            up ? "text-expense" : "text-income"
          )}
        >
          {up ? "+" : "−"}
          {formatMoney(Math.abs(delta), currency)} vs. Vormonat
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Kein Vormonatsvergleich</p>
      )}
    </section>
  );
}
