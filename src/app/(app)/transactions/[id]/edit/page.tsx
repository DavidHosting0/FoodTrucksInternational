import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getTransactionById } from "@/lib/data/finance";
import { ReceiptTipsCard } from "@/components/tips/receipt-tips-card";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { formatMoney } from "@/lib/format";

type Params = Promise<{ id: string }>;
type Search = Promise<{ full?: string }>;

export default async function EditTransactionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { full } = await searchParams;
  const [transaction, categories] = await Promise.all([
    getTransactionById(id),
    getCategories(),
  ]);

  if (!transaction) {
    notFound();
  }

  const showFullForm = full === "1" || !transaction.split_data;

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {showFullForm ? "Bearbeiten" : "Beleg"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {transaction.merchant}
            {" · "}
            {formatMoney(Number(transaction.amount), transaction.currency)}
          </p>
        </div>
        <Link
          href="/dashboard?tab=list"
          className="shrink-0 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Zur Liste
        </Link>
      </div>

      <ReceiptTipsCard
        tips={transaction.ai_tips}
        currency={transaction.currency}
        status={transaction.ai_tips_status}
      />

      {showFullForm ? (
        <div className="space-y-4">
          {transaction.split_data ? (
            <Link
              href={`/transactions/${transaction.id}/edit`}
              className="inline-block text-sm font-medium text-primary"
            >
              ← Zurück zur Aufteilung
            </Link>
          ) : null}
          <div className="rounded-3xl bg-card p-4 sm:p-6">
            <TransactionForm
              categories={categories}
              transaction={transaction}
            />
          </div>
        </div>
      ) : (
        <TransactionDetail
          transaction={transaction}
          categories={categories}
        />
      )}
    </div>
  );
}
