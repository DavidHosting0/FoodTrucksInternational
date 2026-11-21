import { notFound } from "next/navigation";
import { getCategories, getTransactionById } from "@/lib/data/finance";
import { TransactionForm } from "@/components/transactions/transaction-form";

type Params = Promise<{ id: string }>;

export default async function EditTransactionPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [transaction, categories] = await Promise.all([
    getTransactionById(id),
    getCategories(),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Bearbeiten</h1>
        <p className="mt-1 text-sm text-muted-foreground">{transaction.merchant}</p>
      </div>
      <div className="rounded-3xl bg-card p-4 sm:p-6">
        <TransactionForm categories={categories} transaction={transaction} />
      </div>
    </div>
  );
}
