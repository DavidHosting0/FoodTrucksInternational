"use server";

import { createHash, randomUUID } from "crypto";
import { mkdir, rename, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import {
  insertReceipt,
  insertTransaction,
  requireUserId,
} from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";
import {
  parseReceiptImageWithOpenAI,
  parsedReceiptToSplitDraft,
} from "@/lib/ocr/parse-receipt";
import {
  computeSplitTotals,
  splitDataSchema,
  type SplitData,
} from "@/lib/validations/split";
import { z } from "zod";

export type ScanReceiptState = {
  error?: string;
  draft?: SplitData;
  scanId?: string;
  previewUrl?: string;
  ocrText?: string;
};

export type ConfirmReceiptState = {
  error?: string;
  success?: string;
  transactionId?: string;
};

function uploadRoot() {
  const configured = process.env.UPLOAD_DIR || "uploads";
  return path.isAbsolute(configured)
    ? configured
    : path.join(/*turbopackIgnore: true*/ process.cwd(), configured);
}

function scansDir(userId: string) {
  return path.join(/*turbopackIgnore: true*/ uploadRoot(), userId, "_scans");
}

function mapPaymentMethod(
  value: string | null | undefined
):
  | "cash"
  | "debit"
  | "credit"
  | "twint"
  | "transfer"
  | "other"
  | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.includes("twint")) return "twint";
  if (v.includes("cash") || v.includes("bar")) return "cash";
  if (v.includes("credit") || v.includes("visa") || v.includes("master"))
    return "credit";
  if (v.includes("debit") || v.includes("maestro")) return "debit";
  if (v.includes("transfer") || v.includes("überweis")) return "transfer";
  if (["cash", "debit", "credit", "twint", "transfer", "other"].includes(v)) {
    return v as "cash" | "debit" | "credit" | "twint" | "transfer" | "other";
  }
  return "other";
}

export async function scanReceiptAction(
  _prev: ScanReceiptState,
  formData: FormData
): Promise<ScanReceiptState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Foto erforderlich" };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { error: "Datei zu groß (max. 8 MB)" };
  }
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    return { error: "Nur Bilder oder PDF erlaubt" };
  }

  try {
    const userId = await requireUserId();
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(buffer).digest("hex");
    const ext = path.extname(file.name) || ".jpg";
    const scanId = randomUUID();
    const safeName = `${scanId}${ext}`;
    const dir = scansDir(userId);
    await mkdir(dir, { recursive: true });
    const absolute = path.join(/*turbopackIgnore: true*/ dir, safeName);
    await writeFile(absolute, buffer);

    const relativePath = path
      .join(userId, "_scans", safeName)
      .replace(/\\/g, "/");

    let ocrText: string;
    let draft: SplitData;

    if (isDemoMode() || process.env.RECEIPT_OCR_MOCK === "true") {
      ocrText =
        "DEMO BELEG\nMigros\nDatum 21.03.2026 14:32\nMilch 2x 1.95\nBrot 1x 3.20\nTotal CHF 7.10\nVisa ****1234";
      draft = {
        persons: ["Carlo", "David"],
        merchant_meta: {
          merchant: "Migros",
          datetime: "2026-03-21T14:32:00",
          date: "2026-03-21",
          time: "14:32",
          card_type: "Visa",
          payment_last4: "1234",
          payment_method: "credit",
          currency: "CHF",
          total: 7.1,
        },
        items: [
          {
            id: "item-1",
            name: "Milch",
            quantity: 2,
            unit_price: 1.95,
            line_total: 3.9,
            assignments: { Carlo: 2, David: 0 },
          },
          {
            id: "item-2",
            name: "Brot",
            quantity: 1,
            unit_price: 3.2,
            line_total: 3.2,
            assignments: { Carlo: 1, David: 0 },
          },
        ],
        totals: { Carlo: 7.1, David: 0, receipt: 7.1 },
      };
    } else {
      if (file.type === "application/pdf") {
        return {
          error:
            "PDF bitte als Foto/Screenshot senden — OpenAI Vision erwartet ein Bild.",
        };
      }
      const { parsed, rawText } = await parseReceiptImageWithOpenAI(
        buffer,
        file.type || "image/jpeg"
      );
      ocrText = rawText;
      draft = parsedReceiptToSplitDraft(parsed);
    }

    // Persist scan meta next to file for confirm step.
    const metaPath = path.join(
      /*turbopackIgnore: true*/ dir,
      `${scanId}.json`
    );
    await writeFile(
      metaPath,
      JSON.stringify({
        scanId,
        relativePath,
        fileName: file.name || safeName,
        fileType: file.type || "image/jpeg",
        fileSize: file.size,
        contentHash: hash,
        ocrText,
        draft,
      })
    );

    return {
      draft,
      scanId,
      previewUrl: `/api/uploads/${relativePath}`,
      ocrText,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Beleg-Scan fehlgeschlagen";
    if (message.includes("OPENAI_API_KEY")) {
      return { error: "OpenAI API-Key fehlt auf dem Server (.env.local)." };
    }
    if (message.includes("Body exceeded") || message.includes("413")) {
      return { error: "Foto zu groß für den Upload. Bitte erneut versuchen." };
    }
    return { error: message.slice(0, 280) };
  }
}

const confirmSchema = z.object({
  scanId: z.string().uuid(),
  category_id: z.string().uuid(),
  accept_total_mismatch: z.boolean().optional().default(false),
  split: splitDataSchema,
});

export async function confirmReceiptSplitAction(
  _prev: ConfirmReceiptState,
  formData: FormData
): Promise<ConfirmReceiptState> {
  let splitRaw: unknown;
  try {
    splitRaw = JSON.parse(String(formData.get("split_json") ?? ""));
  } catch {
    return { error: "Ungültige Split-Daten" };
  }

  const parsed = confirmSchema.safeParse({
    scanId: formData.get("scanId"),
    category_id: formData.get("category_id"),
    accept_total_mismatch: formData.get("accept_total_mismatch") === "on",
    split: splitRaw,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  const { scanId, category_id, accept_total_mismatch } = parsed.data;
  let split = parsed.data.split;

  for (const item of split.items) {
    const assigned = item.assignments.Carlo + item.assignments.David;
    if (Math.abs(assigned - item.quantity) > 0.01) {
      return {
        error: `Zuweisung für „${item.name}“ muss ${item.quantity} ergeben (aktuell ${assigned}).`,
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

  const itemsSum = split.totals.Carlo + split.totals.David;
  const receiptTotal = split.totals.receipt;
  if (
    Math.abs(itemsSum - receiptTotal) > 0.05 &&
    !accept_total_mismatch
  ) {
    return {
      error: `Summe der Anteile (${itemsSum.toFixed(2)}) weicht vom Belegtotal (${receiptTotal.toFixed(2)}) ab. Bitte prüfen oder Abweichung bestätigen.`,
    };
  }

  try {
    const userId = await requireUserId();
    const metaPath = path.join(
      /*turbopackIgnore: true*/ scansDir(userId),
      `${scanId}.json`
    );
    const { readFile } = await import("fs/promises");
    const meta = JSON.parse(await readFile(metaPath, "utf8")) as {
      relativePath: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      contentHash: string;
      ocrText: string;
    };

    const date =
      split.merchant_meta.date ||
      (split.merchant_meta.datetime
        ? split.merchant_meta.datetime.slice(0, 10)
        : new Date().toISOString().slice(0, 10));

    const amount = split.totals.receipt;
    const currency = split.merchant_meta.currency ?? "CHF";
    const merchant = split.merchant_meta.merchant || "Beleg";

    const tx = await insertTransaction({
      user_id: userId,
      amount,
      currency,
      date,
      category_id,
      merchant,
      description: `${merchant} · Carlo ${split.totals.Carlo.toFixed(2)} / David ${split.totals.David.toFixed(2)}`,
      justification: "",
      subcategory: null,
      payment_method: mapPaymentMethod(split.merchant_meta.payment_method),
      location: null,
      is_recurring: false,
      scope: "private",
      notes: split.merchant_meta.card_type
        ? `Karte: ${split.merchant_meta.card_type}${
            split.merchant_meta.payment_last4
              ? ` ****${split.merchant_meta.payment_last4}`
              : ""
          }`
        : null,
      necessity: null,
      purchase_type: "spontaneous",
      satisfaction: null,
      split_data: split,
      ai_tips: null,
      ai_tips_status: "pending",
    });

    try {
      const { analyzeReceiptTipsWithOpenAI } = await import(
        "@/lib/ai/expense-tips"
      );
      const { updateTransactionAiTips } = await import("@/lib/data/finance");
      const analysis = await analyzeReceiptTipsWithOpenAI({
        transactionId: tx.id,
        merchant,
        date,
        total: amount,
        currency,
        items: split.items,
      });
      await updateTransactionAiTips(tx.id, analysis.tips, "done");
    } catch {
      try {
        const { updateTransactionAiTips } = await import("@/lib/data/finance");
        await updateTransactionAiTips(tx.id, [], "error");
      } catch {
        /* Tipps dürfen Speichern nicht blockieren */
      }
    }

    if (!isDemoMode()) {
      const scanAbs = path.join(
        /*turbopackIgnore: true*/ uploadRoot(),
        meta.relativePath
      );
      const finalName = `${Date.now()}-${meta.contentHash.slice(0, 12)}${path.extname(meta.relativePath) || ".jpg"}`;
      const userDir = path.join(/*turbopackIgnore: true*/ uploadRoot(), userId);
      await mkdir(userDir, { recursive: true });
      const finalAbs = path.join(/*turbopackIgnore: true*/ userDir, finalName);
      await rename(scanAbs, finalAbs).catch(async () => {
        const { copyFile } = await import("fs/promises");
        await copyFile(scanAbs, finalAbs);
      });
      const finalRel = path.join(userId, finalName).replace(/\\/g, "/");

      await insertReceipt({
        file_path: finalRel,
        file_name: meta.fileName,
        file_type: meta.fileType,
        file_size: meta.fileSize,
        content_hash: meta.contentHash,
        transaction_id: tx.id,
        ocr_raw_text: meta.ocrText,
        ocr_data: split as unknown as Record<string, unknown>,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/receipts");
    return {
      success: "Ausgabe mit Split gespeichert",
      transactionId: tx.id,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }
}
