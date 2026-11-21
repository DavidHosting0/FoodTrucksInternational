"use server";

import { revalidatePath } from "next/cache";
import { analyzeTransactionTips } from "@/lib/ai/expense-tips";
import {
  listUnevaluatedTransactions,
  updateTransactionAiTips,
} from "@/lib/data/finance";

export type ActionState = {
  error?: string;
  success?: string;
};

const CATCHUP_BATCH = 8;

export async function analyzeExpenseTipsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const month = String(formData.get("month") ?? "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { error: "Ungültiger Monat" };
  }

  try {
    const pending = await listUnevaluatedTransactions(month);
    if (pending.length === 0) {
      return { success: "Alle Belege dieses Monats sind bereits bewertet" };
    }

    const batch = pending.slice(0, CATCHUP_BATCH);
    let ok = 0;
    let failed = 0;
    let tipCount = 0;

    for (const tx of batch) {
      try {
        await updateTransactionAiTips(tx.id, tx.ai_tips ?? [], "pending");
        const analysis = await analyzeTransactionTips(tx);
        await updateTransactionAiTips(tx.id, analysis.tips, "done");
        tipCount += analysis.tips.length;
        ok += 1;
      } catch {
        await updateTransactionAiTips(tx.id, [], "error");
        failed += 1;
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    const remaining = pending.length - batch.length;
    const parts = [
      `${ok} Beleg${ok === 1 ? "" : "e"} bewertet`,
      tipCount > 0 ? `${tipCount} Tipps` : null,
      failed > 0 ? `${failed} Fehler` : null,
      remaining > 0 ? `${remaining} noch offen — nochmal tippen` : null,
    ].filter(Boolean);

    return { success: parts.join(" · ") };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analyse fehlgeschlagen";
    return { error: message };
  }
}
