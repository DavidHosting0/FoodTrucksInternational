import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import type { TransactionWithCategory } from "@/types/database";
import { formatMoney } from "@/lib/format";

export type DashboardMetrics = {
  currentTotal: number;
  previousTotal: number;
  dailyAverage: number;
  transactionCount: number;
  largestExpense: number;
  savingsPotential: number;
  avoidableShare: number;
  currency: string;
  monthOverMonthDelta: number;
  monthlyTrend: { month: string; label: string; total: number }[];
  byCategory: { name: string; total: number; color: string }[];
  byMerchant: { name: string; total: number }[];
  avoidableTrend: { month: string; label: string; total: number }[];
  insights: string[];
};

function sum(transactions: TransactionWithCategory[]) {
  return transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
}

function isAvoidable(tx: TransactionWithCategory) {
  return tx.necessity === "optional" || tx.necessity === "unnecessary";
}

function monthKey(date: Date) {
  return format(date, "yyyy-MM");
}

export function computeDashboardMetrics(
  transactions: TransactionWithCategory[],
  now = new Date()
): DashboardMetrics {
  const currency = transactions[0]?.currency ?? "CHF";
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  const previousStart = startOfMonth(subMonths(now, 1));
  const previousEnd = endOfMonth(subMonths(now, 1));

  const current = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d >= currentStart && d <= currentEnd;
  });
  const previous = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d >= previousStart && d <= previousEnd;
  });

  const currentTotal = sum(current);
  const previousTotal = sum(previous);
  const dayOfMonth = Math.max(1, now.getDate());
  const dailyAverage = currentTotal / dayOfMonth;
  const largestExpense =
    current.length > 0
      ? Math.max(...current.map((tx) => Number(tx.amount)))
      : 0;

  const avoidableCurrent = current.filter(isAvoidable);
  const savingsPotential = sum(avoidableCurrent);
  const avoidableShare =
    currentTotal > 0 ? (savingsPotential / currentTotal) * 100 : 0;

  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const monthDate = subMonths(now, 11 - i);
    const key = monthKey(monthDate);
    const total = sum(
      transactions.filter((tx) => monthKey(new Date(tx.date)) === key)
    );
    return {
      month: key,
      label: format(monthDate, "MMM yy"),
      total,
    };
  });

  const categoryMap = new Map<string, { total: number; color: string }>();
  for (const tx of current) {
    const name = tx.categories?.name ?? "Sonstiges";
    const color = tx.categories?.color ?? "#94a3b8";
    const existing = categoryMap.get(name) ?? { total: 0, color };
    existing.total += Number(tx.amount);
    categoryMap.set(name, existing);
  }
  const byCategory = [...categoryMap.entries()]
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const merchantMap = new Map<string, number>();
  for (const tx of current) {
    merchantMap.set(
      tx.merchant,
      (merchantMap.get(tx.merchant) ?? 0) + Number(tx.amount)
    );
  }
  const byMerchant = [...merchantMap.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const avoidableTrend = Array.from({ length: 12 }, (_, i) => {
    const monthDate = subMonths(now, 11 - i);
    const key = monthKey(monthDate);
    const total = sum(
      transactions.filter(
        (tx) => monthKey(new Date(tx.date)) === key && isAvoidable(tx)
      )
    );
    return {
      month: key,
      label: format(monthDate, "MMM yy"),
      total,
    };
  });

  const insights: string[] = [];

  if (current.length === 0) {
    insights.push(
      "Noch keine Ausgaben in diesem Monat. Erfasse Transaktionen, um Einsparpotenziale zu sehen."
    );
  } else {
    const restaurantPrev = sum(
      previous.filter((tx) =>
        (tx.categories?.name ?? "").toLowerCase().includes("restaurant")
      )
    );
    const restaurantCurr = sum(
      current.filter((tx) =>
        (tx.categories?.name ?? "").toLowerCase().includes("restaurant")
      )
    );
    const restaurantDelta = restaurantCurr - restaurantPrev;
    if (restaurantDelta > 0 && restaurantCurr > 0) {
      insights.push(
        `Du hast diesen Monat ${formatMoney(restaurantDelta, currency)} mehr für Restaurants ausgegeben als im Vormonat.`
      );
    }

    const subscriptions = current.filter(
      (tx) =>
        tx.is_recurring ||
        (tx.categories?.name ?? "").toLowerCase().includes("abonnement")
    );
    if (subscriptions.length > 0) {
      const yearly = sum(subscriptions) * 12;
      insights.push(
        `Deine Abonnements/wiederkehrenden Kosten könnten dich jährlich ca. ${formatMoney(yearly, currency)} kosten.`
      );
    }

    const impulse = sum(
      current.filter(
        (tx) =>
          tx.purchase_type === "impulse" || tx.purchase_type === "spontaneous"
      )
    );
    if (impulse > 0) {
      insights.push(
        `Du hast ${formatMoney(impulse, currency)} für spontane/Impulskäufe ausgegeben.`
      );
    }

    if (savingsPotential > 0) {
      insights.push(
        `Bei deinen aktuellen Ausgaben könntest du monatlich ca. ${formatMoney(savingsPotential, currency)} einsparen.`
      );
    }

    if (previousTotal > 0) {
      const delta = currentTotal - previousTotal;
      if (delta !== 0) {
        insights.push(
          delta > 0
            ? `Gesamtausgaben liegen ${formatMoney(delta, currency)} über dem Vormonat.`
            : `Gesamtausgaben liegen ${formatMoney(Math.abs(delta), currency)} unter dem Vormonat.`
        );
      }
    }
  }

  // Ensure we always have a few insight slots filled for empty-ish states
  while (insights.length < 2 && current.length > 0) {
    insights.push(
      `Durchschnittlich ${formatMoney(dailyAverage, currency)} pro Tag in diesem Monat.`
    );
    break;
  }

  return {
    currentTotal,
    previousTotal,
    dailyAverage,
    transactionCount: current.length,
    largestExpense,
    savingsPotential,
    avoidableShare,
    currency,
    monthOverMonthDelta: currentTotal - previousTotal,
    monthlyTrend,
    byCategory,
    byMerchant,
    avoidableTrend,
    insights: insights.slice(0, 4),
  };
}

export function monthComparisonData(metrics: DashboardMetrics) {
  return [
    { name: "Vormonat", total: metrics.previousTotal },
    { name: "Aktuell", total: metrics.currentTotal },
  ];
}
