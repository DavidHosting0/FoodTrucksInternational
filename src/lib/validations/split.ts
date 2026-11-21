import { z } from "zod";

export const SPLIT_PERSONS = ["Carlo", "David"] as const;
export type SplitPerson = (typeof SPLIT_PERSONS)[number];

export const merchantMetaSchema = z.object({
  merchant: z.string().min(1),
  datetime: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  card_type: z.string().nullable().optional(),
  payment_last4: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  currency: z.enum(["CHF", "EUR", "USD"]).optional().default("CHF"),
  total: z.number().nonnegative().nullable().optional(),
});

export const splitAssignmentsSchema = z.object({
  // Stückzahlen; bei qty=1 „Beide“ → 0.5 / 0.5
  Carlo: z.number().nonnegative(),
  David: z.number().nonnegative(),
});

export const splitItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
  line_total: z.number().nonnegative(),
  assignments: splitAssignmentsSchema,
});

export const splitTotalsSchema = z.object({
  Carlo: z.number().nonnegative(),
  David: z.number().nonnegative(),
  receipt: z.number().nonnegative(),
});

export const splitDataSchema = z.object({
  persons: z.tuple([z.literal("Carlo"), z.literal("David")]),
  merchant_meta: merchantMetaSchema,
  items: z.array(splitItemSchema),
  totals: splitTotalsSchema,
});

export type MerchantMeta = z.infer<typeof merchantMetaSchema>;
export type SplitItem = z.infer<typeof splitItemSchema>;
export type SplitData = z.infer<typeof splitDataSchema>;

/** OpenAI parse output before assignments are applied. */
export const parsedReceiptSchema = z.object({
  merchant: z.string().min(1).default("Unbekannt"),
  datetime: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  card_type: z.string().nullable().optional(),
  payment_last4: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  currency: z.enum(["CHF", "EUR", "USD"]).catch("CHF"),
  total: z.number().nonnegative().nullable().optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().positive().default(1),
        unit_price: z.number().nonnegative(),
        line_total: z.number().nonnegative().optional(),
      })
    )
    .default([]),
  raw_text: z.string().nullable().optional(),
});

export type ParsedReceipt = z.infer<typeof parsedReceiptSchema>;

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function lineTotal(quantity: number, unitPrice: number) {
  return roundMoney(quantity * unitPrice);
}

export function computeSplitTotals(
  items: Array<{
    quantity: number;
    unit_price: number;
    line_total?: number;
    assignments: { Carlo: number; David: number };
  }>,
  receiptTotal?: number | null
) {
  let carlo = 0;
  let david = 0;
  for (const item of items) {
    const total =
      item.line_total ?? lineTotal(item.quantity, item.unit_price);
    const qty = item.quantity || 1;
    const unit = total / qty;
    carlo += unit * item.assignments.Carlo;
    david += unit * item.assignments.David;
  }
  const receipt =
    receiptTotal != null && receiptTotal > 0
      ? roundMoney(receiptTotal)
      : roundMoney(carlo + david);
  return {
    Carlo: roundMoney(carlo),
    David: roundMoney(david),
    receipt,
  };
}

export function defaultAssignments(quantity: number): {
  Carlo: number;
  David: number;
} {
  const qty = Math.max(1, Math.round(quantity));
  // Default: all to Carlo; user reassigns in review.
  return { Carlo: qty, David: 0 };
}
