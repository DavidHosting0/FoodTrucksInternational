import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  PiggyBank,
  Receipt,
  TrendingDown,
} from "lucide-react";
import type { DashboardMetrics } from "@/lib/analytics/dashboard";
import { formatMoney } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCards({ metrics }: { metrics: DashboardMetrics }) {
  const deltaUp = metrics.monthOverMonthDelta > 0;
  const items = [
    {
      title: "Ausgaben aktueller Monat",
      value: formatMoney(metrics.currentTotal, metrics.currency),
      icon: CircleDollarSign,
      hint:
        metrics.previousTotal > 0
          ? `${deltaUp ? "+" : ""}${formatMoney(metrics.monthOverMonthDelta, metrics.currency)} vs. Vormonat`
          : "Kein Vormonatsvergleich",
      tone: deltaUp ? "up" : "down",
    },
    {
      title: "Ausgaben Vormonat",
      value: formatMoney(metrics.previousTotal, metrics.currency),
      icon: Receipt,
      hint: "Vergleichsbasis",
    },
    {
      title: "Ø täglich",
      value: formatMoney(metrics.dailyAverage, metrics.currency),
      icon: TrendingDown,
      hint: `${metrics.transactionCount} Transaktionen`,
    },
    {
      title: "Größte Einzelausgabe",
      value: formatMoney(metrics.largestExpense, metrics.currency),
      icon: ArrowUpRight,
      hint: "Dieser Monat",
    },
    {
      title: "Einsparpotenzial",
      value: formatMoney(metrics.savingsPotential, metrics.currency),
      icon: PiggyBank,
      hint: "Optional / unnötig",
    },
    {
      title: "Vermeidbare Ausgaben",
      value: `${metrics.avoidableShare.toFixed(0)} %`,
      icon: ArrowDownRight,
      hint: "Anteil am Monatsvolumen",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title} className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight tabular-nums">
              {item.value}
            </div>
            <p
              className={`mt-1 text-xs ${
                "tone" in item && item.tone === "up"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {item.hint}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
