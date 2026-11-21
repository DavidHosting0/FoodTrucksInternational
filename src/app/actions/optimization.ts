"use server";

import { revalidatePath } from "next/cache";
import { generateSavingsOpportunities } from "@/lib/analytics/optimization";
import {
  getRecurringExpenses,
  getTransactions,
  replaceSavingsOpportunities,
} from "@/lib/data/finance";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function refreshOptimizationAction() {
  const { isDemoMode } = await import("@/lib/demo/mode");
  if (isDemoMode()) {
    return;
  }

  try {
    const [transactions, subscriptions] = await Promise.all([
      getTransactions(),
      getRecurringExpenses(),
    ]);
    const currency = transactions[0]?.currency ?? "CHF";
    const items = generateSavingsOpportunities(
      transactions,
      subscriptions,
      currency
    );
    await replaceSavingsOpportunities(items);
  } catch {
    // page will still show live heuristics
  }

  revalidatePath("/optimization");
  revalidatePath("/dashboard");
}
