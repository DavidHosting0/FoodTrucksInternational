import { format } from "date-fns";
import {
  getCategories,
  getExpenseTipsReport,
  getHouseholdBudget,
  getRecurringExpenses,
  getSavingsOpportunities,
  getTransactions,
} from "@/lib/data/finance";
import { computeDashboardMetrics } from "@/lib/analytics/dashboard";
import { generateSavingsOpportunities } from "@/lib/analytics/optimization";
import { monthPersonTotals } from "@/lib/analytics/split";
import { formatMoney } from "@/lib/format";
import { HomeSpaces } from "@/components/home/home-spaces";
import {
  CaptureSpace,
  ListSpace,
  MoreSpace,
  OverviewSpace,
  TipsSpace,
} from "@/components/home/space-panels";

function yearly(amount: number, interval: string) {
  if (interval === "monthly") return amount * 12;
  if (interval === "quarterly") return amount * 4;
  return amount;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ space?: string; tab?: string; month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? format(new Date(), "yyyy-MM");

  const [
    transactions,
    householdBudget,
    subscriptions,
    categories,
    stored,
    tipsReport,
  ] = await Promise.all([
    getTransactions(),
    getHouseholdBudget(month),
    getRecurringExpenses(),
    getCategories(),
    getSavingsOpportunities(),
    getExpenseTipsReport(month),
  ]);

  const metrics = computeDashboardMetrics(transactions);
  const personTotals = monthPersonTotals(transactions, month);
  const budgetTotal = householdBudget ? Number(householdBudget.amount) : 0;
  const budgetSpent = personTotals.total;
  const budgetPct =
    budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : null;

  const activeSubs = subscriptions.filter((s) => s.is_active);
  const subYearly = activeSubs.reduce(
    (sum, s) => sum + yearly(Number(s.amount), s.interval),
    0
  );

  const currency =
    householdBudget?.currency ??
    transactions[0]?.currency ??
    metrics.currency;
  const opportunities =
    stored.length > 0
      ? stored
      : generateSavingsOpportunities(
          transactions,
          subscriptions,
          currency
        ).map((item, index) => ({
          ...item,
          id: `tmp-${index}`,
          user_id: "tmp",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

  const totalYearly = opportunities.reduce(
    (sum, item) => sum + Number(item.yearly_savings),
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
      `Budget-Auslastung diesen Monat: ${budgetPct}% (${formatMoney(budgetSpent, currency)} von ${formatMoney(budgetTotal, currency)}).`
    );
  }

  return (
    <HomeSpaces
      initialSpace={params.tab ?? params.space}
      panels={{
        home: (
          <OverviewSpace
            metrics={metrics}
            insights={insights}
            budgetPct={budgetPct}
            budgetSpent={budgetSpent}
            budgetTotal={budgetTotal}
            subYearly={subYearly}
            activeSubs={activeSubs.length}
          />
        ),
        list: (
          <ListSpace
            transactions={transactions}
            month={month}
            carloTotal={personTotals.carlo}
            davidTotal={personTotals.david}
            currency={currency}
          />
        ),
        capture: <CaptureSpace categories={categories} />,
        tips: (
          <TipsSpace
            month={month}
            report={tipsReport}
            currency={currency}
          />
        ),
        more: (
          <MoreSpace
            opportunities={opportunities}
            currency={currency}
            totalYearly={totalYearly}
            categories={categories}
            subscriptions={subscriptions}
          />
        ),
      }}
    />
  );
}
