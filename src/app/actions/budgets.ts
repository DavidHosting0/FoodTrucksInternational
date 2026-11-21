"use server";

import { revalidatePath } from "next/cache";
import { deleteBudget, upsertBudget } from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function saveBudgetAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode()) {
    return { error: "Im Demo-Modus nicht verfügbar – bitte Postgres nutzen." };
  }

  const categoryId = String(formData.get("category_id") ?? "");
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "CHF");
  const month = String(formData.get("month") ?? "");

  if (!categoryId || !month || !(amount >= 0)) {
    return { error: "Ungültige Budget-Angaben" };
  }

  try {
    await upsertBudget({
      category_id: categoryId,
      amount,
      currency,
      month,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: "Budget gespeichert" };
}

export async function deleteBudgetAction(id: string): Promise<ActionState> {
  if (isDemoMode()) {
    return { error: "Im Demo-Modus nicht verfügbar – bitte Postgres nutzen." };
  }

  try {
    await deleteBudget(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Löschen fehlgeschlagen",
    };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: "Budget gelöscht" };
}
