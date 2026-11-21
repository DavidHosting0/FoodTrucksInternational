import { getCategories } from "@/lib/data/finance";
import { TransactionForm } from "@/components/transactions/transaction-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewTransactionPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Ausgabe erfassen
        </h1>
        <p className="text-sm text-muted-foreground">
          Pflichtfelder, Bewertung und optionale Details in einem Formular.
        </p>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle>Neue Transaktion</CardTitle>
          <CardDescription>
            Begründe jede Ausgabe – das hilft später bei der Cost Optimization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
