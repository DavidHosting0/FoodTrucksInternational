"use server";

import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import {
  insertReceipt,
  insertTransaction,
  requireUserId,
} from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";
import { z } from "zod";

export type CameraExpenseState = {
  error?: string;
  success?: string;
};

const payloadSchema = z.object({
  amount: z.coerce.number().positive("Betrag muss positiv sein"),
  currency: z.enum(["CHF", "EUR", "USD"]).default("CHF"),
  category_id: z.string().uuid("Kategorie erforderlich"),
  merchant: z.string().min(1).max(200).default("Beleg"),
  date: z.string().min(1, "Datum erforderlich"),
});

function uploadRoot() {
  const configured = process.env.UPLOAD_DIR || "uploads";
  return path.isAbsolute(configured)
    ? configured
    : path.join(/*turbopackIgnore: true*/ process.cwd(), configured);
}

export async function createExpenseWithReceipt(
  _prev: CameraExpenseState,
  formData: FormData
): Promise<CameraExpenseState> {
  const merchantRaw = String(formData.get("merchant") ?? "").trim();
  const parsed = payloadSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency") || "CHF",
    category_id: formData.get("category_id"),
    merchant: merchantRaw || "Beleg",
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Foto oder Beleg erforderlich" };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { error: "Datei zu groß (max. 8 MB)" };
  }
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowed.includes(file.type) && !file.type.startsWith("image/")) {
    return { error: "Nur Bilddateien erlaubt" };
  }

  try {
    const userId = await requireUserId();
    const data = parsed.data;
    const tx = await insertTransaction({
      user_id: userId,
      amount: data.amount,
      currency: data.currency,
      date: data.date,
      category_id: data.category_id,
      merchant: data.merchant,
      description: data.merchant,
      justification: "",
      subcategory: null,
      payment_method: null,
      location: null,
      is_recurring: false,
      scope: "private",
      notes: null,
      necessity: null,
      purchase_type: "spontaneous",
      satisfaction: null,
      split_data: null,
    });

    if (!isDemoMode()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const hash = createHash("sha256").update(buffer).digest("hex");
      const ext = path.extname(file.name) || ".jpg";
      const safeName = `${Date.now()}-${hash.slice(0, 12)}${ext}`;
      const userDir = path.join(/*turbopackIgnore: true*/ uploadRoot(), userId);
      await mkdir(userDir, { recursive: true });
      const absolute = path.join(/*turbopackIgnore: true*/ userDir, safeName);
      await writeFile(absolute, buffer);
      const relativePath = path.join(userId, safeName).replace(/\\/g, "/");

      await insertReceipt({
        file_path: relativePath,
        file_name: file.name || "beleg.jpg",
        file_type: file.type || "image/jpeg",
        file_size: file.size,
        content_hash: hash,
        transaction_id: tx.id,
      });
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/receipts");
  return { success: "Ausgabe mit Beleg gespeichert" };
}
