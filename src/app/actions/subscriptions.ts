"use server";

import { revalidatePath } from "next/cache";
import {
  deleteRecurringExpense,
  insertRecurringExpense,
  updateRecurringExpense,
} from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";

export type ActionState = {
  error?: string;
  success?: string;
};

function demoBlocked(): ActionState | null {
  if (isDemoMode()) {
    return { error: "Im Demo-Modus nicht verfügbar – bitte Postgres nutzen." };
  }
  return null;
}

function parseForm(formData: FormData) {
  return {
    merchant: String(formData.get("merchant") ?? "").trim(),
    amount: Number(formData.get("amount")),
    currency: String(formData.get("currency") ?? "CHF"),
    interval: String(formData.get("interval") ?? "monthly"),
    category_id: String(formData.get("category_id") ?? "") || null,
    next_payment_date: String(formData.get("next_payment_date") ?? "") || null,
    cancellation_notice_days: formData.get("cancellation_notice_days")
      ? Number(formData.get("cancellation_notice_days"))
      : null,
    notes: String(formData.get("notes") ?? "") || null,
    is_active: formData.get("is_active") !== "off",
  };
}

export async function createSubscriptionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = demoBlocked();
  if (blocked) return blocked;

  const data = parseForm(formData);
  if (!data.merchant || !(data.amount > 0)) {
    return { error: "Händler und Betrag erforderlich" };
  }

  try {
    await insertRecurringExpense(data);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  revalidatePath("/optimization");
  return { success: "Abo erstellt" };
}

export async function updateSubscriptionAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = demoBlocked();
  if (blocked) return blocked;

  const data = parseForm(formData);
  if (!data.merchant || !(data.amount > 0)) {
    return { error: "Händler und Betrag erforderlich" };
  }

  try {
    await updateRecurringExpense(id, data);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { success: "Abo aktualisiert" };
}

export async function deleteSubscriptionAction(
  id: string
): Promise<ActionState> {
  const blocked = demoBlocked();
  if (blocked) return blocked;

  try {
    await deleteRecurringExpense(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Löschen fehlgeschlagen",
    };
  }

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
  return { success: "Abo gelöscht" };
}
