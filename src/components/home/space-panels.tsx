import Link from "next/link";
import { refreshOptimizationAction } from "@/app/actions/optimization";
import type { DashboardMetrics } from "@/lib/analytics/dashboard";
import { formatMoney } from "@/lib/format";
import type {
  Budget,
  Category,
  RecurringExpense,
  SavingsOpportunity,
  TransactionWithCategory,
} from "@/types/database";
import { BudgetsManager } from "@/components/budgets/budgets-manager";
import { MonthPicker } from "@/components/budgets/month-picker";
import { HeroBalance } from "@/components/dashboard/hero-balance";
import { InsightsList } from "@/components/dashboard/insights";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SnapshotChips } from "@/components/dashboard/snapshot-chips";
import { ReceiptCaptureFlow } from "@/components/receipts/receipt-capture-flow";
import { SubscriptionsManager } from "@/components/subscriptions/subscriptions-manager";
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
}: {
  transactions: TransactionWithCategory[];
}) {
  return (
    <div className="space-y-4 pb-4 pt-2">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Liste</h2>
        <p className="mt-1 text-sm text-muted-foreground">Alle Bewegungen</p>
      </div>
      <TransactionsTable transactions={transactions} />
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

export function BudgetsSpace({
  categories,
  budgets,
  month,
}: {
  categories: Category[];
  budgets: (Budget & { categories?: Category | null; spent: number })[];
  month: string;
}) {
  return (
    <div className="space-y-5 pb-4 pt-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Budget</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Limits & Fortschritt
          </p>
        </div>
        <MonthPicker month={month} />
      </div>
      <BudgetsManager
        categories={categories}
        budgets={budgets}
        month={month}
      />
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
