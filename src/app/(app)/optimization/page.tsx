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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cost Optimization
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Heuristische Vorschläge aus Ausgaben und Abos.
          </p>
        </div>
        <form action={refreshOptimizationAction}>
          <Button type="submit" className="h-11 w-full sm:w-auto">
            Neu analysieren & speichern
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <p className="text-sm text-muted-foreground">Geschätzte Jahresersparnis</p>
        <p className="text-2xl font-semibold tabular-nums">
          {formatMoney(totalYearly, currency)}
        </p>
      </div>

      <ul className="space-y-3">
        {opportunities.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
            Noch keine Vorschläge. Erfasse Ausgaben und Abos, dann analysieren.
          </li>
        ) : (
          opportunities.map((item) => (
            <li
              key={item.id}
              className="space-y-2 rounded-xl border border-border/60 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-medium">{item.title}</h2>
                <Badge variant="secondary">
                  {priorityLabel[item.priority]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-sm">{item.suggested_action}</p>
              <p className="text-sm tabular-nums">
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
