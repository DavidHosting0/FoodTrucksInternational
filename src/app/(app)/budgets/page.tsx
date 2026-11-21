import { format } from "date-fns";
import {
  getHouseholdBudget,
  getTransactions,
} from "@/lib/data/finance";
import { monthPersonTotals } from "@/lib/analytics/split";
import { HouseholdBudgetCard } from "@/components/budgets/household-budget-card";
import { MonthPicker } from "@/components/budgets/month-picker";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? format(new Date(), "yyyy-MM");
  const [budget, transactions] = await Promise.all([
    getHouseholdBudget(month),
    getTransactions(),
  ]);
  const personTotals = monthPersonTotals(transactions, month);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Budget</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gesamt für Carlo & David
          </p>
        </div>
        <MonthPicker month={month} />
      </div>
      <HouseholdBudgetCard
        month={month}
        budget={budget}
        spent={personTotals.total}
        carlo={personTotals.carlo}
        david={personTotals.david}
      />
    </div>
  );
}
