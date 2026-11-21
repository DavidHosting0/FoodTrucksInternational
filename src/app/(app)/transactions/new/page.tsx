import { getCategories } from "@/lib/data/finance";
import { TransactionForm } from "@/components/transactions/transaction-form";

export default async function NewTransactionPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Neue Ausgabe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Schnell erfassen — Details kannst du später ergänzen.
        </p>
      </div>
      <div className="rounded-3xl bg-card p-4 sm:p-6">
        <TransactionForm categories={categories} />
      </div>
    </div>
  );
}
