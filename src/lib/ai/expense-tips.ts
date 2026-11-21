import { z } from "zod";
import type { TransactionWithCategory } from "@/types/database";

const tipSchema = z.object({
  transaction_id: z.string().nullable().optional(),
  merchant: z.string().default(""),
  item: z.string().nullable().optional(),
  severity: z
    .enum(["unnecessary", "questionable", "ok"])
    .default("questionable"),
  necessity: z
    .enum(["necessary", "sensible", "optional", "unnecessary"])
    .default("optional"),
  reason: z.string().min(1),
  alternative: z.string().min(1),
  estimated_savings: z.number().nonnegative().default(0),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

const analysisSchema = z.object({
  summary: z.string().default(""),
  estimated_monthly_savings: z.number().nonnegative().default(0),
  tips: z.array(tipSchema).default([]),
});

export type ExpenseTipsAnalysis = z.infer<typeof analysisSchema>;

function resolveModel() {
  return process.env.OPENAI_MODEL || "gpt-4o";
}

function requireApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY fehlt");
  }
  return apiKey;
}

function buildPayload(
  transactions: TransactionWithCategory[],
  month: string,
  currency: string
) {
  const monthTx = transactions
    .filter((tx) => tx.date.slice(0, 7) === month.slice(0, 7))
    .slice(0, 45);

  return {
    month: month.slice(0, 7),
    currency,
    household: ["Carlo", "David"],
    transactions: monthTx.map((tx) => ({
      id: tx.id,
      date: tx.date,
      merchant: tx.merchant,
      amount: Number(tx.amount),
      category: tx.categories?.name ?? null,
      necessity: tx.necessity,
      items: (tx.split_data?.items ?? []).slice(0, 40).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        line_total: item.line_total,
      })),
    })),
  };
}

function systemPrompt(currency: string) {
  return `Du bist ein sparsam-pragmatischer Haushalts-Coach für Carlo und David (Schweiz/EU).
Analysiere Monatsausgaben und gekaufte Artikelpositionen. Antworte NUR mit gültigem JSON:
{
  "summary": string,
  "estimated_monthly_savings": number,
  "tips": [{
    "transaction_id": string|null,
    "merchant": string,
    "item": string|null,
    "severity": "unnecessary"|"questionable"|"ok",
    "necessity": "necessary"|"sensible"|"optional"|"unnecessary",
    "reason": string,
    "alternative": string,
    "estimated_savings": number,
    "priority": "low"|"medium"|"high"
  }]
}
Regeln:
- Bewerte konkrete Artikel, nicht nur Händler. Beispiel: Bei Lidl/Migros Backware → Alternativ Nudel-/Reispackung oder haltbare Grundnahrungsmittel, weil länger haltbar und weniger Impulskonsum.
- Markiere echte Verschwendung als severity "unnecessary" und necessity "unnecessary".
- Markiere zweifelhafte Käufe als "questionable"/"optional".
- Sinnvolle Grundversorgung als "ok"/"sensible" oder "necessary" — nur erwähnen wenn besonders gut.
- Alternativen müssen konkret, realistisch und im gleichen Laden/Einkaufskontext umsetzbar sein.
- maximal 12 Tipps, priorisiert nach Sparpotenzial.
- Nur Deutsch, kurz und klar.
- estimated_savings in ${currency} pro Monat (Schätzung).`;
}

export async function analyzeExpenseTipsWithOpenAI(
  transactions: TransactionWithCategory[],
  month: string,
  currency = "CHF"
): Promise<ExpenseTipsAnalysis> {
  const apiKey = requireApiKey();
  const payload = buildPayload(transactions, month, currency);

  if (payload.transactions.length === 0) {
    return {
      summary: "Für diesen Monat gibt es noch keine Ausgaben zum Bewerten.",
      estimated_monthly_savings: 0,
      tips: [],
    };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolveModel(),
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt(currency),
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI Tipps fehlgeschlagen: ${res.status} ${errBody}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI Tipps: leere Antwort");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new Error("OpenAI Tipps: ungültiges JSON");
  }

  const parsed = analysisSchema.parse(raw);
  const validIds = new Set(payload.transactions.map((tx) => tx.id));

  return {
    ...parsed,
    tips: parsed.tips
      .map((tip) => ({
        ...tip,
        transaction_id:
          tip.transaction_id && validIds.has(tip.transaction_id)
            ? tip.transaction_id
            : null,
        merchant: tip.merchant || "Unbekannt",
        item: tip.item ?? null,
        estimated_savings: Number(tip.estimated_savings) || 0,
      }))
      .slice(0, 12),
  };
}
