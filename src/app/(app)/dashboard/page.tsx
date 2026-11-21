import { format } from "date-fns";
import {
  getBudgets,
  getCategories,
  getRecurringExpenses,
  getSavingsOpportunities,
  getTransactions,
} from "@/lib/data/finance";
import { computeDashboardMetrics } from "@/lib/analytics/dashboard";
import { generateSavingsOpportunities } from "@/lib/analytics/optimization";
import { formatMoney } from "@/lib/format";
import { HomeSpaces } from "@/components/home/home-spaces";
import {
  BudgetsSpace,
  CaptureSpace,
  ListSpace,
  MoreSpace,
  OverviewSpace,
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

  const [transactions, budgets, subscriptions, categories, stored] =
    await Promise.all([
      getTransactions(),
      getBudgets(month),
      getRecurringExpenses(),
      getCategories(),
      getSavingsOpportunities(),
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

  const currency = transactions[0]?.currency ?? metrics.currency;
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
      `Budget-Auslastung diesen Monat: ${budgetPct}% (${formatMoney(budgetSpent, metrics.currency)} von ${formatMoney(budgetTotal, metrics.currency)}).`
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
        list: <ListSpace transactions={transactions} />,
        capture: <CaptureSpace categories={categories} />,
        budget: (
          <BudgetsSpace
            categories={categories}
            budgets={budgetRows}
            month={month}
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
