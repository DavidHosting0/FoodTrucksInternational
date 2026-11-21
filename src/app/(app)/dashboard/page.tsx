import { format } from "date-fns";
import {
  getBudgets,
  getRecurringExpenses,
  getTransactions,
} from "@/lib/data/finance";
import { computeDashboardMetrics } from "@/lib/analytics/dashboard";
import { HeroBalance } from "@/components/dashboard/hero-balance";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SnapshotChips } from "@/components/dashboard/snapshot-chips";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { InsightsList } from "@/components/dashboard/insights";
import { formatMoney } from "@/lib/format";

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
  const budgetTotal = budgetRows.reduce((sum, b) => sum + Number(b.amount), 0);
  const budgetSpent = budgetRows.reduce((sum, b) => sum + b.spent, 0);
  const budgetPct =
    budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : null;

  const activeSubs = subscriptions.filter((s) => s.is_active);
  const subYearly = activeSubs.reduce(
    (sum, s) => sum + yearly(Number(s.amount), s.interval),
    0
  );

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
    <div className="space-y-8">
      <HeroBalance
        total={metrics.currentTotal}
        currency={metrics.currency}
        delta={metrics.monthOverMonthDelta}
      />
      <QuickActions />
      <SnapshotChips
        budgetPct={budgetPct}
        budgetSpent={budgetSpent}
        budgetTotal={budgetTotal}
        subYearly={subYearly}
        currency={metrics.currency}
        activeSubs={activeSubs.length}
      />
      <KpiCards metrics={metrics} />
      <InsightsList insights={insights.slice(0, 4)} />
      <DashboardCharts metrics={metrics} />
    </div>
  );
}
