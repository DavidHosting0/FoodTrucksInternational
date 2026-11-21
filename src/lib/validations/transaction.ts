import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Betrag muss positiv sein"),
  currency: z.enum(["CHF", "EUR", "USD"]),
  date: z.string().min(1, "Datum erforderlich"),
  category_id: z.string().uuid("Kategorie erforderlich"),
  merchant: z.string().min(1, "Händler erforderlich").max(200),
  description: z.string().max(500).optional().or(z.literal("")),
  justification: z.string().max(1000).optional().or(z.literal("")),
  subcategory: z.string().max(100).optional().or(z.literal("")),
  payment_method: z
    .enum(["cash", "debit", "credit", "twint", "transfer", "other"])
    .optional()
    .or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  is_recurring: z.boolean().default(false),
  scope: z.enum(["private", "business"]).default("private"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  necessity: z
    .enum(["necessary", "sensible", "optional", "unnecessary"])
    .optional()
    .or(z.literal("")),
  purchase_type: z
    .enum(["planned", "spontaneous", "impulse", "emergency"])
    .optional()
    .or(z.literal("")),
  satisfaction: z
    .enum([
      "very_satisfied",
      "satisfied",
      "neutral",
      "unsatisfied",
      "regret",
    ])
    .optional()
    .or(z.literal("")),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
