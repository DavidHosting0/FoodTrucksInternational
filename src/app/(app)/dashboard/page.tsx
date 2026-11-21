import Link from "next/link";
import { format } from "date-fns";
import {
  getBudgets,
  getRecurringExpenses,
  getTransactions,
} from "@/lib/data/finance";
import { computeDashboardMetrics } from "@/lib/analytics/dashboard";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { InsightsList } from "@/components/dashboard/insights";
import { formatMoney } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function yearly(amount: number, interval: string) {
  if (interval === "monthly") return amount * 12;
  if (interval === "quarterly") return amount * 4;
  return amount;
}

export default async function DashboardPage() {
  const month = format(new Date(), "yyyy-MM");
  const [transactions, budgets, subscriptions] = await Promise.all([
    getTransactions(),
    getBudgets(month),
    getRecurringExpenses(),
  ]);
  const metrics = computeDashboardMetrics(transactions);

  const budgetRows = budgets.map((budget) => {
    const spent = transactions
      .filter(
        (tx) =>
          tx.date.slice(0, 7) === month && tx.category_id === budget.category_id
      )
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { ...budget, spent };
  });
  const budgetTotal = budgetRows.reduce(
    (sum, b) => sum + Number(b.amount),
    0
  );
  const budgetSpent = budgetRows.reduce((sum, b) => sum + b.spent, 0);
  const budgetPct =
    budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : null;

  const subYearly = subscriptions
    .filter((s) => s.is_active)
    .reduce((sum, s) => sum + yearly(Number(s.amount), s.interval), 0);

  const insights = [...metrics.insights];
  if (subYearly > 0) {
    insights.unshift(
      `Aktive Abos kosten dich ca. ${formatMoney(subYearly, metrics.currency)} pro Jahr.`
    );
  }
  if (budgetPct !== null) {
    insights.unshift(
      `Budget-Auslastung diesen Monat: ${budgetPct}% (${formatMoney(budgetSpent, metrics.currency)} von ${formatMoney(budgetTotal, metrics.currency)}).`
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Finanzübersicht und Einsparpotenziale auf Basis deiner echten Daten.
          </p>
        </div>
        <Link
          href="/transactions/new"
          className={cn(buttonVariants(), "h-11 w-full sm:w-auto")}
        >
          Ausgabe erfassen
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget-Auslastung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {budgetPct === null ? "—" : `${budgetPct}%`}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {budgetTotal > 0
                ? `${formatMoney(budgetSpent, metrics.currency)} von ${formatMoney(budgetTotal, metrics.currency)}`
                : "Noch keine Budgets gesetzt"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abos / Jahr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {formatMoney(subYearly, metrics.currency)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {subscriptions.filter((s) => s.is_active).length} aktive Abos
            </p>
          </CardContent>
        </Card>
      </div>

      <KpiCards metrics={metrics} />
      <InsightsList insights={insights.slice(0, 5)} />
      <DashboardCharts metrics={metrics} />
    </div>
  );
}
