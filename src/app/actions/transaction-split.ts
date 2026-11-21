"use server";

import { revalidatePath } from "next/cache";
import {
  getTransactionById,
  patchTransaction,
  requireUserId,
} from "@/lib/data/finance";
import {
  computeSplitTotals,
  splitDataSchema,
} from "@/lib/validations/split";
import { z } from "zod";

export type ActionState = {
  error?: string;
  success?: string;
};

const schema = z.object({
  category_id: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),
  split: splitDataSchema,
});

export async function updateTransactionSplitAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  let splitRaw: unknown;
  try {
    splitRaw = JSON.parse(String(formData.get("split_json") ?? ""));
  } catch {
    return { error: "Ungültige Split-Daten" };
  }

  const parsed = schema.safeParse({
    category_id: String(formData.get("category_id") ?? ""),
    split: splitRaw,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  let split = parsed.data.split;
  for (const item of split.items) {
    const assigned = item.assignments.Carlo + item.assignments.David;
    if (Math.abs(assigned - item.quantity) > 0.01) {
      return {
        error: `Zuweisung für „${item.name}“ muss ${item.quantity} ergeben.`,
      };
    }
  }

  split = {
    ...split,
    totals: computeSplitTotals(
      split.items,
      split.merchant_meta.total ?? split.totals.receipt
    ),
  };

  try {
    await requireUserId();
    const existing = await getTransactionById(id);
    if (!existing) return { error: "Transaktion nicht gefunden" };

    const merchant = split.merchant_meta.merchant || existing.merchant;
    const date =
      split.merchant_meta.date ||
      (split.merchant_meta.datetime
        ? split.merchant_meta.datetime.slice(0, 10)
        : existing.date);
    const currency = split.merchant_meta.currency ?? existing.currency;
    const amount = split.totals.receipt;

    await patchTransaction(id, {
      user_id: existing.user_id,
      amount,
      currency,
      date,
      category_id: parsed.data.category_id,
      merchant,
      description: `${merchant} · Carlo ${split.totals.Carlo.toFixed(2)} / David ${split.totals.David.toFixed(2)}`,
      justification: existing.justification,
      subcategory: existing.subcategory,
      payment_method: existing.payment_method,
      location: existing.location,
      is_recurring: existing.is_recurring,
      scope: existing.scope,
      notes: existing.notes,
      necessity: existing.necessity,
      purchase_type: existing.purchase_type,
      satisfaction: existing.satisfaction,
      split_data: split,
      ai_tips: existing.ai_tips,
      ai_tips_status: existing.ai_tips_status,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${id}/edit`);
  return { success: "Aufteilung gespeichert" };
}
