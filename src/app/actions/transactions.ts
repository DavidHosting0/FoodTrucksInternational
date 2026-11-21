"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  insertTransaction,
  patchTransaction,
  removeTransaction,
  requireUserId,
} from "@/lib/data/finance";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transaction";

export type ActionState = {
  error?: string;
  success?: string;
};

function emptyToNull(value: string | undefined | null) {
  if (!value || value === "") return null;
  return value;
}

function toPayload(data: TransactionInput, userId: string) {
  return {
    user_id: userId,
    amount: data.amount,
    currency: data.currency,
    date: data.date,
    category_id: data.category_id,
    merchant: data.merchant.trim(),
    description: (data.description ?? "").trim() || data.merchant.trim(),
    justification: (data.justification ?? "").trim() || "",
    subcategory: emptyToNull(data.subcategory)?.trim() ?? null,
    payment_method: emptyToNull(data.payment_method) as
      | "cash"
      | "debit"
      | "credit"
      | "twint"
      | "transfer"
      | "other"
      | null,
    location: emptyToNull(data.location)?.trim() ?? null,
    is_recurring: data.is_recurring ?? false,
    scope: data.scope ?? ("private" as const),
    notes: emptyToNull(data.notes)?.trim() ?? null,
    necessity: emptyToNull(data.necessity) as
      | "necessary"
      | "sensible"
      | "optional"
      | "unnecessary"
      | null,
    purchase_type: emptyToNull(data.purchase_type) as
      | "planned"
      | "spontaneous"
      | "impulse"
      | "emergency"
      | null,
    satisfaction: emptyToNull(data.satisfaction) as
      | "very_satisfied"
      | "satisfied"
      | "neutral"
      | "unsatisfied"
      | "regret"
      | null,
    split_data: null,
  };
}

export async function createTransaction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = transactionSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    date: formData.get("date"),
    category_id: formData.get("category_id"),
    merchant: formData.get("merchant"),
    description: formData.get("description"),
    justification: formData.get("justification"),
    subcategory: formData.get("subcategory") || "",
    payment_method: formData.get("payment_method") || "",
    location: formData.get("location") || "",
    is_recurring: formData.get("is_recurring") === "on",
    scope: formData.get("scope") || "private",
    notes: formData.get("notes") || "",
    necessity: formData.get("necessity") || "",
    purchase_type: formData.get("purchase_type") || "",
    satisfaction: formData.get("satisfaction") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  try {
    const userId = await requireUserId();
    await insertTransaction(toPayload(parsed.data, userId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function updateTransaction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = transactionSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    date: formData.get("date"),
    category_id: formData.get("category_id"),
    merchant: formData.get("merchant"),
    description: formData.get("description"),
    justification: formData.get("justification"),
    subcategory: formData.get("subcategory") || "",
    payment_method: formData.get("payment_method") || "",
    location: formData.get("location") || "",
    is_recurring: formData.get("is_recurring") === "on",
    scope: formData.get("scope") || "private",
    notes: formData.get("notes") || "",
    necessity: formData.get("necessity") || "",
    purchase_type: formData.get("purchase_type") || "",
    satisfaction: formData.get("satisfaction") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  try {
    const userId = await requireUserId();
    await patchTransaction(id, toPayload(parsed.data, userId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${id}/edit`);
  redirect("/transactions");
}

export async function deleteTransaction(id: string): Promise<ActionState> {
  try {
    await removeTransaction(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Löschen fehlgeschlagen",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: "Transaktion gelöscht" };
}
