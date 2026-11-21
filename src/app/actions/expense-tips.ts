"use server";

import { revalidatePath } from "next/cache";
import { analyzeExpenseTipsWithOpenAI } from "@/lib/ai/expense-tips";
import {
  getTransactions,
  updateTransactionNecessities,
  upsertExpenseTipsReport,
} from "@/lib/data/finance";
import type { Necessity } from "@/types/database";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function analyzeExpenseTipsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const month = String(formData.get("month") ?? "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { error: "Ungültiger Monat" };
  }

  try {
    const transactions = await getTransactions();
    const currency = transactions[0]?.currency ?? "CHF";
    const analysis = await analyzeExpenseTipsWithOpenAI(
      transactions,
      month,
      currency
    );

    await upsertExpenseTipsReport({
      month,
      summary: analysis.summary,
      tips: analysis.tips.map((tip) => ({
        transaction_id: tip.transaction_id ?? null,
        merchant: tip.merchant,
        item: tip.item ?? null,
        severity: tip.severity,
        necessity: tip.necessity,
        reason: tip.reason,
        alternative: tip.alternative,
        estimated_savings: tip.estimated_savings,
        priority: tip.priority,
      })),
      estimated_monthly_savings: analysis.estimated_monthly_savings,
    });

    const necessityUpdates = new Map<string, Necessity>();
    for (const tip of analysis.tips) {
      if (!tip.transaction_id) continue;
      if (
        tip.necessity === "unnecessary" ||
        tip.necessity === "optional" ||
        tip.severity === "unnecessary"
      ) {
        const next: Necessity =
          tip.severity === "unnecessary" || tip.necessity === "unnecessary"
            ? "unnecessary"
            : tip.necessity;
        const prev = necessityUpdates.get(tip.transaction_id);
        if (
          !prev ||
          (prev !== "unnecessary" && next === "unnecessary") ||
          (prev === "sensible" || prev === "necessary")
        ) {
          necessityUpdates.set(tip.transaction_id, next);
        }
      }
    }

    await updateTransactionNecessities(
      [...necessityUpdates.entries()].map(([id, necessity]) => ({
        id,
        necessity,
      }))
    );

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/optimization");

    return {
      success:
        analysis.tips.length > 0
          ? `${analysis.tips.length} Tipps erstellt`
          : "Analyse fertig — keine kritischen Tipps",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analyse fehlgeschlagen";
    return { error: message };
  }
}
