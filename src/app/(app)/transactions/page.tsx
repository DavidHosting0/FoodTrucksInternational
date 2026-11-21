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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Transaktionen
          </h1>
          <p className="text-sm text-muted-foreground">
            Alle Ausgaben durchsuchen, filtern und bearbeiten.
          </p>
        </div>
        <Link href="/transactions/new" className={cn(buttonVariants())}>
          Neue Ausgabe
        </Link>
      </div>

      <Suspense fallback={<Skeleton className="h-28 w-full" />}>
        <TransactionFilters categories={categories} />
      </Suspense>

      <TransactionsTable transactions={transactions} />
    </div>
  );
}
