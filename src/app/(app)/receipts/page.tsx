import { getReceipts, getTransactions } from "@/lib/data/finance";
import { ReceiptsManager } from "@/components/receipts/receipts-manager";

export default async function ReceiptsPage() {
  const [receipts, transactions] = await Promise.all([
    getReceipts(),
    getTransactions(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Belege</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fotos oder PDFs speichern und optional mit Ausgaben verknüpfen.
        </p>
      </div>
      <ReceiptsManager receipts={receipts} transactions={transactions} />
    </div>
  );
}
