"use server";

import { revalidatePath } from "next/cache";
import { upsertHouseholdBudget } from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function saveHouseholdBudgetAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode()) {
    return { error: "Im Demo-Modus nicht verfügbar – bitte Postgres nutzen." };
  }

  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "CHF");
  const month = String(formData.get("month") ?? "");

  if (!month || !(amount >= 0)) {
    return { error: "Ungültige Budget-Angaben" };
  }

  try {
    await upsertHouseholdBudget({ amount, currency, month });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: "Monatsbudget gespeichert" };
}
