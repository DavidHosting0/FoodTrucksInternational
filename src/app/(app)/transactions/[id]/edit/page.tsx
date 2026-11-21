import { notFound } from "next/navigation";
import { getCategories, getTransactionById } from "@/lib/data/finance";
import { TransactionForm } from "@/components/transactions/transaction-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Transaktion bearbeiten
        </h1>
        <p className="text-sm text-muted-foreground">
          Änderungen werden sofort in Dashboard und Auswertungen berücksichtigt.
        </p>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle>Bearbeiten</CardTitle>
          <CardDescription>{transaction.merchant}</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm
            categories={categories}
            transaction={transaction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
