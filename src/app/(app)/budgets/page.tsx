import { format } from "date-fns";
import { getBudgets, getCategories, getTransactions } from "@/lib/data/finance";
import { BudgetsManager } from "@/components/budgets/budgets-manager";
import { MonthPicker } from "@/components/budgets/month-picker";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? format(new Date(), "yyyy-MM");
  const [categories, budgets, transactions] = await Promise.all([
    getCategories(),
    getBudgets(month),
    getTransactions(),
  ]);

  const withSpend = budgets.map((budget) => {
    const spent = transactions
      .filter((tx) => {
        const d = tx.date.slice(0, 7);
        return d === month && tx.category_id === budget.category_id;
      })
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { ...budget, spent };
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monatliche Limits pro Kategorie und Fortschritt.
          </p>
        </div>
        <MonthPicker month={month} />
      </div>
      <BudgetsManager
        categories={categories}
        budgets={withSpend}
        month={month}
      />
    </div>
  );
}
