import { refreshOptimizationAction } from "@/app/actions/optimization";
import {
  getRecurringExpenses,
  getSavingsOpportunities,
  getTransactions,
} from "@/lib/data/finance";
import { generateSavingsOpportunities } from "@/lib/analytics/optimization";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const priorityLabel = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
} as const;

export default async function OptimizationPage() {
  const [stored, transactions, subscriptions] = await Promise.all([
    getSavingsOpportunities(),
    getTransactions(),
    getRecurringExpenses(),
  ]);

  const currency = transactions[0]?.currency ?? "CHF";
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

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Optimize</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sparpotenziale aus deinen Daten
          </p>
        </div>
        <form action={refreshOptimizationAction}>
          <Button type="submit" variant="secondary">
            Neu analysieren
          </Button>
        </form>
      </div>

      <div className="rounded-3xl bg-card px-5 py-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Geschätzte Jahresersparnis
        </p>
        <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-primary">
          {formatMoney(totalYearly, currency)}
        </p>
      </div>

      <ul className="space-y-2">
        {opportunities.length === 0 ? (
          <li className="rounded-3xl bg-card px-4 py-12 text-center text-sm text-muted-foreground">
            Noch keine Vorschläge. Erfasse Ausgaben und Abos.
          </li>
        ) : (
          opportunities.map((item) => (
            <li key={item.id} className="space-y-2 rounded-3xl bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-medium">{item.title}</h2>
                <Badge variant="secondary">{priorityLabel[item.priority]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-sm">{item.suggested_action}</p>
              <p className="text-sm font-semibold tabular-nums text-primary">
                ~{formatMoney(Number(item.monthly_savings), currency)}/Monat ·{" "}
                {formatMoney(Number(item.yearly_savings), currency)}/Jahr
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
