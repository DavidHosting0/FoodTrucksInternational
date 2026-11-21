import Link from "next/link";
import { refreshOptimizationAction } from "@/app/actions/optimization";
import type { DashboardMetrics } from "@/lib/analytics/dashboard";
import { formatMoney } from "@/lib/format";
import type {
  Category,
  ExpenseTipsReport,
  RecurringExpense,
  SavingsOpportunity,
  TransactionWithCategory,
} from "@/types/database";
import { MonthPicker } from "@/components/budgets/month-picker";
import { HeroBalance } from "@/components/dashboard/hero-balance";
import { InsightsList } from "@/components/dashboard/insights";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SnapshotChips } from "@/components/dashboard/snapshot-chips";
import { ReceiptCaptureFlow } from "@/components/receipts/receipt-capture-flow";
import { SubscriptionsManager } from "@/components/subscriptions/subscriptions-manager";
import { ExpenseTipsPanel } from "@/components/tips/expense-tips-panel";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const priorityLabel = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
} as const;

export function OverviewSpace({
  metrics,
  insights,
  budgetPct,
  budgetSpent,
  budgetTotal,
  subYearly,
  activeSubs,
}: {
  metrics: DashboardMetrics;
  insights: string[];
  budgetPct: number | null;
  budgetSpent: number;
  budgetTotal: number;
  subYearly: number;
  activeSubs: number;
}) {
  return (
    <div className="space-y-6 pb-4 pt-2">
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
        activeSubs={activeSubs}
      />
      <KpiCards metrics={metrics} />
      <InsightsList insights={insights.slice(0, 4)} />
    </div>
  );
}

export function ListSpace({
  transactions,
  month,
  carloTotal,
  davidTotal,
  currency,
}: {
  transactions: TransactionWithCategory[];
  month: string;
  carloTotal: number;
  davidTotal: number;
  currency: string;
}) {
  const monthTx = transactions.filter((tx) => tx.date.slice(0, 7) === month);

  return (
    <div className="space-y-4 pb-4 pt-2">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Liste</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ausgaben {month}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="metal-surface rounded-3xl px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Carlo
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-primary">
            {formatMoney(carloTotal, currency)}
          </p>
        </div>
        <div className="metal-surface rounded-3xl px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            David
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums">
            {formatMoney(davidTotal, currency)}
          </p>
        </div>
      </div>

      <TransactionsTable transactions={monthTx} />
    </div>
  );
}

export function CaptureSpace({ categories }: { categories: Category[] }) {
  return (
    <div className="pb-4 pt-2">
      <ReceiptCaptureFlow categories={categories} autoOpenCamera />
    </div>
  );
}

export function TipsSpace({
  month,
  report,
  currency,
}: {
  month: string;
  report: ExpenseTipsReport | null;
  currency: string;
}) {
  return (
    <div className="space-y-5 pb-4 pt-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tipps</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI bewertet Ausgaben & Artikel
          </p>
        </div>
        <MonthPicker month={month} />
      </div>
      <ExpenseTipsPanel month={month} report={report} currency={currency} />
    </div>
  );
}

export function MoreSpace({
  opportunities,
  currency,
  totalYearly,
  categories,
  subscriptions,
}: {
  opportunities: SavingsOpportunity[];
  currency: string;
  totalYearly: number;
  categories: Category[];
  subscriptions: (RecurringExpense & { categories?: Category | null })[];
}) {
  return (
    <div className="space-y-6 pb-4 pt-2">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Mehr</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optimize, Abos & Einstellungen
        </p>
      </div>

      <div className="metal-surface grid gap-1 rounded-3xl p-2">
        {[
          { href: "/settings", label: "Einstellungen" },
          { href: "/budgets", label: "Gesamtbudget" },
          { href: "/receipts", label: "Belege" },
          { href: "/categories", label: "Kategorien" },
          { href: "/reports", label: "Reports" },
          { href: "/subscriptions", label: "Abos verwalten" },
          { href: "/optimization", label: "Cost Optimization" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="metal-plate rounded-3xl px-5 py-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
          Sparpotenzial / Jahr
        </p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
          {formatMoney(totalYearly, currency)}
        </p>
        <form action={refreshOptimizationAction} className="mt-4">
          <Button type="submit" variant="secondary" size="sm">
            Neu analysieren
          </Button>
        </form>
      </div>

      <ul className="space-y-2">
        {opportunities.slice(0, 3).map((item) => (
          <li key={item.id} className="metal-surface space-y-2 rounded-3xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{item.title}</h3>
              <Badge variant="secondary">{priorityLabel[item.priority]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <h3 className="px-1 text-sm font-semibold">Abos</h3>
        <SubscriptionsManager
          categories={categories}
          subscriptions={subscriptions}
        />
      </div>
    </div>
  );
}
