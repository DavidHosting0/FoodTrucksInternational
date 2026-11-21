import type {
  RecurringExpense,
  SavingsOpportunity,
  TransactionWithCategory,
} from "@/types/database";
import { formatMoney } from "@/lib/format";

function toMonthly(amount: number, interval: string) {
  if (interval === "yearly") return amount / 12;
  if (interval === "quarterly") return amount / 3;
  return amount;
}

export function generateSavingsOpportunities(
  transactions: TransactionWithCategory[],
  subscriptions: RecurringExpense[],
  currency = "CHF"
): Omit<
  SavingsOpportunity,
  "id" | "user_id" | "created_at" | "updated_at"
>[] {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const current = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const items: Omit<
    SavingsOpportunity,
    "id" | "user_id" | "created_at" | "updated_at"
  >[] = [];

  const avoidable = current.filter(
    (tx) => tx.necessity === "optional" || tx.necessity === "unnecessary"
  );
  const avoidableTotal = avoidable.reduce((s, tx) => s + Number(tx.amount), 0);
  if (avoidableTotal > 0) {
    items.push({
      title: "Vermeidbare Ausgaben reduzieren",
      description: `${avoidable.length} Ausgaben als optional/unnötig markiert (${formatMoney(avoidableTotal, currency)}).`,
      affected_transaction_ids: avoidable.map((tx) => tx.id),
      monthly_cost: avoidableTotal,
      suggested_action:
        "Prüfe optionale Käufe vor dem Bezahlen und setze ein Monatslimit.",
      monthly_savings: Math.round(avoidableTotal * 0.5 * 100) / 100,
      yearly_savings: Math.round(avoidableTotal * 0.5 * 12 * 100) / 100,
      priority: avoidableTotal > 200 ? "high" : "medium",
    });
  }

  const activeSubs = subscriptions.filter((s) => s.is_active);
  const expensive = activeSubs
    .map((s) => ({
      ...s,
      monthly: toMonthly(Number(s.amount), s.interval),
    }))
    .filter((s) => s.monthly >= 15)
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, 5);

  for (const sub of expensive) {
    items.push({
      title: `Abo prüfen: ${sub.merchant}`,
      description: `${formatMoney(sub.monthly, currency)}/Monat (${sub.interval}).`,
      affected_transaction_ids: [],
      monthly_cost: sub.monthly,
      suggested_action:
        "Nutzung prüfen, günstigeren Tarif suchen oder kündigen.",
      monthly_savings: Math.round(sub.monthly * 0.4 * 100) / 100,
      yearly_savings: Math.round(sub.monthly * 0.4 * 12 * 100) / 100,
      priority: sub.monthly >= 40 ? "high" : "medium",
    });
  }

  const byCategory = new Map<string, { total: number; ids: string[] }>();
  for (const tx of current) {
    const name = tx.categories?.name ?? "Sonstiges";
    const entry = byCategory.get(name) ?? { total: 0, ids: [] };
    entry.total += Number(tx.amount);
    entry.ids.push(tx.id);
    byCategory.set(name, entry);
  }

  const totals = [...byCategory.entries()].sort(
    (a, b) => b[1].total - a[1].total
  );
  if (totals.length > 0) {
    const [topName, top] = totals[0];
    const monthTotal = current.reduce((s, tx) => s + Number(tx.amount), 0);
    if (monthTotal > 0 && top.total / monthTotal >= 0.35) {
      items.push({
        title: `Hoher Anteil: ${topName}`,
        description: `${Math.round((top.total / monthTotal) * 100)}% der Monatsausgaben (${formatMoney(top.total, currency)}).`,
        affected_transaction_ids: top.ids,
        monthly_cost: top.total,
        suggested_action: `Budget für „${topName}“ setzen und Wochenlimit tracken.`,
        monthly_savings: Math.round(top.total * 0.15 * 100) / 100,
        yearly_savings: Math.round(top.total * 0.15 * 12 * 100) / 100,
        priority: "medium",
      });
    }
  }

  const impulse = current.filter(
    (tx) =>
      tx.purchase_type === "impulse" || tx.purchase_type === "spontaneous"
  );
  const impulseTotal = impulse.reduce((s, tx) => s + Number(tx.amount), 0);
  if (impulseTotal > 50) {
    items.push({
      title: "Impuls- und Spontankäufe",
      description: `${formatMoney(impulseTotal, currency)} spontan/impulsiv in diesem Monat.`,
      affected_transaction_ids: impulse.map((tx) => tx.id),
      monthly_cost: impulseTotal,
      suggested_action: "24-Stunden-Regel vor nicht geplanten Käufen.",
      monthly_savings: Math.round(impulseTotal * 0.3 * 100) / 100,
      yearly_savings: Math.round(impulseTotal * 0.3 * 12 * 100) / 100,
      priority: "low",
    });
  }

  return items;
}
