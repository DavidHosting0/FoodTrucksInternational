"use server";

import { createHash } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import {
  deleteReceipt,
  insertReceipt,
  linkReceiptToTransaction,
  requireUserId,
} from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";

export type ActionState = {
  error?: string;
  success?: string;
};

function uploadRoot() {
  const configured = process.env.UPLOAD_DIR || "uploads";
  return path.isAbsolute(configured)
    ? configured
    : path.join(/*turbopackIgnore: true*/ process.cwd(), configured);
}

export async function uploadReceiptAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (isDemoMode()) {
    return { error: "Im Demo-Modus nicht verfügbar – bitte Postgres nutzen." };
  }

  const file = formData.get("file");
  const transactionId = String(formData.get("transaction_id") ?? "") || null;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Datei erforderlich" };
  }

  if (file.size > 8 * 1024 * 1024) {
    return { error: "Datei zu groß (max. 8 MB)" };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) {
    return { error: "Nur JPEG, PNG, WebP oder PDF erlaubt" };
  }

  try {
    const userId = await requireUserId();
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(buffer).digest("hex");
    const ext = path.extname(file.name) || ".bin";
    const safeName = `${Date.now()}-${hash.slice(0, 12)}${ext}`;
    const userDir = path.join(/*turbopackIgnore: true*/ uploadRoot(), userId);
    await mkdir(userDir, { recursive: true });
    const absolute = path.join(/*turbopackIgnore: true*/ userDir, safeName);
    await writeFile(absolute, buffer);

    const relativePath = path.join(userId, safeName).replace(/\\/g, "/");

    await insertReceipt({
      file_path: relativePath,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      content_hash: hash,
      transaction_id: transactionId,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Upload fehlgeschlagen",
    };
  }

  revalidatePath("/receipts");
  return { success: "Beleg gespeichert" };
}

export async function linkReceiptAction(
  receiptId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const transactionId = String(formData.get("transaction_id") ?? "") || null;
  try {
    await linkReceiptToTransaction(receiptId, transactionId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Verknüpfung fehlgeschlagen",
    };
  }
  revalidatePath("/receipts");
  return { success: "Beleg verknüpft" };
}

export async function deleteReceiptAction(id: string): Promise<ActionState> {
  try {
    const filePath = await deleteReceipt(id);
    const absolute = path.join(/*turbopackIgnore: true*/ uploadRoot(), filePath);
    await unlink(absolute).catch(() => undefined);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Löschen fehlgeschlagen",
    };
  }
  revalidatePath("/receipts");
  return { success: "Beleg gelöscht" };
}
