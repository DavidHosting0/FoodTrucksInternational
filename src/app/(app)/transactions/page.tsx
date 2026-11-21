import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getTransactions } from "@/lib/data/finance";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  from?: string;
  to?: string;
}>;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [categories, allTransactions] = await Promise.all([
    getCategories(),
    getTransactions(),
  ]);

  let transactions = allTransactions;

  if (params.category) {
    transactions = transactions.filter(
      (tx) => tx.category_id === params.category
    );
  }
  if (params.from) {
    transactions = transactions.filter((tx) => tx.date >= params.from!);
  }
  if (params.to) {
    transactions = transactions.filter((tx) => tx.date <= params.to!);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    transactions = transactions.filter(
      (tx) =>
        tx.merchant.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.justification.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {transactions.length} Transaktionen
          </p>
        </div>
        <Link
          href="/transactions/new"
          className={cn(buttonVariants(), "hidden sm:inline-flex")}
        >
          Neue Ausgabe
        </Link>
      </div>

      <Suspense fallback={<Skeleton className="h-14 w-full rounded-3xl" />}>
        <TransactionFilters categories={categories} />
      </Suspense>

      <TransactionsTable transactions={transactions} />
    </div>
  );
}
