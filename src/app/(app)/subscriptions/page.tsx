import {
  getCategories,
  getRecurringExpenses,
} from "@/lib/data/finance";
import { SubscriptionsManager } from "@/components/subscriptions/subscriptions-manager";

export default async function SubscriptionsPage() {
  const [categories, subscriptions] = await Promise.all([
    getCategories(),
    getRecurringExpenses(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Abonnements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wiederkehrende Kosten im Blick – inkl. Jahreshochrechnung.
        </p>
      </div>
      <SubscriptionsManager
        categories={categories}
        subscriptions={subscriptions}
      />
    </div>
  );
}
