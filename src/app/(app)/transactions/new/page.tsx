import { getCategories } from "@/lib/data/finance";
import { ReceiptCaptureFlow } from "@/components/receipts/receipt-capture-flow";

export default async function NewTransactionPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">Ausgabe erfassen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Beleg fotografieren — OCR erkennt Positionen, danach Carlo/David zuteilen.
        </p>
      </div>
      <ReceiptCaptureFlow categories={categories} autoOpenCamera />
    </div>
  );
}
