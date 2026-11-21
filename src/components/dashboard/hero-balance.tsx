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
    <section className="animate-hero-in relative overflow-hidden rounded-[1.75rem] metal-plate px-5 py-8 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
        {subtitle}
      </p>
      <p className="mt-3 text-5xl font-semibold tracking-tight tabular-nums text-white sm:text-6xl">
        {formatMoney(total, currency)}
      </p>
      {delta !== 0 ? (
        <p
          className={cn(
            "mt-3 text-sm font-medium tabular-nums",
            up ? "text-red-200" : "text-emerald-100"
          )}
        >
          {up ? "+" : "−"}
          {formatMoney(Math.abs(delta), currency)} vs. Vormonat
        </p>
      ) : (
        <p className="mt-3 text-sm text-white/65">Kein Vormonatsvergleich</p>
      )}
    </section>
  );
}
