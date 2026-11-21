import { z } from "zod";
import type {
  ExpenseTip,
  ReceiptSplitItem,
  TransactionWithCategory,
} from "@/types/database";

const tipSchema = z.object({
  title: z.string().min(1),
  item: z.string().nullable().optional(),
  why: z.string().min(1),
  instead: z.string().min(1),
  how: z.array(z.string()).default([]),
  severity: z.enum(["waste", "questionable", "ok"]).default("questionable"),
  estimated_savings: z.number().nonnegative().default(0),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

const receiptAnalysisSchema = z.object({
  tips: z.array(tipSchema).default([]),
});

export type ReceiptTipsAnalysis = {
  tips: ExpenseTip[];
};

function resolveTipsModel() {
  return process.env.OPENAI_TIPS_MODEL || "gpt-4o-mini";
}

function requireApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY fehlt");
  }
  return apiKey;
}

function shorten(name: string, max = 48) {
  const cleaned = name.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

export function compactReceiptItems(items: ReceiptSplitItem[] | undefined) {
  return (items ?? []).slice(0, 40).map((item) => ({
    n: shorten(item.name),
    q: Number(item.quantity) || 1,
    p: Number(item.line_total) || 0,
  }));
}

function systemPrompt(currency: string) {
  return `Du bist der freche Haushalts-Roaster für Carlo & David (Schweiz).
Bewerte EINEN Beleg anhand der Artikel. Antworte NUR mit JSON:
{"tips":[{"title":string,"item":string|null,"why":string,"instead":string,"how":[string],"severity":"waste"|"questionable"|"ok","estimated_savings":number,"priority":"low"|"medium"|"high"}]}

Regeln:
- Maximal 3 Tipps. Bei normalem vernünftigem Einkauf: tips=[].
- Sei spezifisch zum ARTIKEL (Name + Preis), nicht generisch zum Laden.
- why: detailreich, klar, auf Deutsch. Bei waste: sarkastisch/beleidigend erlaubt.
- instead: konkrete Alternative im gleichen Kontext (z.B. Lidl Backware → Nudel-/Reispackung, haltbarer, weniger Impuls).
- how: 1-3 kurze Handlungsschritte.
- estimated_savings in ${currency} (Schätzung für diesen Fehlkauf / Monatseffekt).
- severity waste nur bei echter Verschwendung; questionable bei zweifelhaft; ok nur wenn der Tipp wirklich wertvoll ist.`;
}

function mapTip(
  tip: z.infer<typeof tipSchema>,
  ctx: { transactionId: string; merchant: string }
): ExpenseTip {
  const severity =
    tip.severity === "waste"
      ? "unnecessary"
      : tip.severity === "ok"
        ? "ok"
        : "questionable";
  const necessity =
    tip.severity === "waste"
      ? "unnecessary"
      : tip.severity === "ok"
        ? "sensible"
        : "optional";

  return {
    transaction_id: ctx.transactionId,
    merchant: ctx.merchant,
    item: tip.item ?? null,
    title: tip.title,
    why: tip.why,
    instead: tip.instead,
    how: tip.how.slice(0, 3),
    reason: tip.why,
    alternative: tip.instead,
    severity,
    tip_severity: tip.severity,
    necessity,
    estimated_savings: Number(tip.estimated_savings) || 0,
    priority: tip.priority,
  };
}

export async function analyzeReceiptTipsWithOpenAI(input: {
  transactionId: string;
  merchant: string;
  date: string;
  total: number;
  currency: string;
  items: ReceiptSplitItem[] | undefined;
}): Promise<ReceiptTipsAnalysis> {
  const apiKey = requireApiKey();
  const compactItems = compactReceiptItems(input.items);

  const payload = {
    m: shorten(input.merchant, 64),
    d: input.date.slice(0, 10),
    t: Number(input.total),
    c: input.currency,
    i: compactItems,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolveTipsModel(),
      temperature: 0.5,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt(input.currency) },
        { role: "user", content: JSON.stringify(payload) },
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

  const parsed = receiptAnalysisSchema.parse(raw);
  const tips = parsed.tips
    .slice(0, 3)
    .map((tip) =>
      mapTip(tip, {
        transactionId: input.transactionId,
        merchant: input.merchant,
      })
    )
    // Drop pure "ok" fluff unless it has a real alternative
    .filter((tip) => tip.tip_severity !== "ok" || tip.estimated_savings > 0);

  return { tips };
}

/** Catch-up: analyze one stored transaction. */
export async function analyzeTransactionTips(
  tx: TransactionWithCategory | {
    id: string;
    merchant: string;
    date: string;
    amount: number;
    currency: string;
    split_data: { items?: ReceiptSplitItem[] } | null;
  }
): Promise<ReceiptTipsAnalysis> {
  return analyzeReceiptTipsWithOpenAI({
    transactionId: tx.id,
    merchant: tx.merchant,
    date: tx.date,
    total: Number(tx.amount),
    currency: tx.currency,
    items: tx.split_data?.items,
  });
}
