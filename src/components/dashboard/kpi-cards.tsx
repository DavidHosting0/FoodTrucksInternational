import type { DashboardMetrics } from "@/lib/analytics/dashboard";
import { formatMoney } from "@/lib/format";

/** Compact metric strip — replaces the old 6-card dashboard grid. */
export function KpiCards({ metrics }: { metrics: DashboardMetrics }) {
  const items = [
    {
      label: "Ø täglich",
      value: formatMoney(metrics.dailyAverage, metrics.currency),
    },
    {
      label: "Transaktionen",
      value: String(metrics.transactionCount),
    },
    {
      label: "Einsparpotenzial",
      value: formatMoney(metrics.savingsPotential, metrics.currency),
    },
    {
      label: "Vermeidbar",
      value: `${metrics.avoidableShare.toFixed(0)}%`,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="metal-surface rounded-3xl px-3 py-3.5">
          <p className="text-[11px] font-medium text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums tracking-tight">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}
