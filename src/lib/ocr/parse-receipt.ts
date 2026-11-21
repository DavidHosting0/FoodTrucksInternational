import {
  defaultAssignments,
  lineTotal,
  parsedReceiptSchema,
  type ParsedReceipt,
  type SplitData,
  computeSplitTotals,
  roundMoney,
} from "@/lib/validations/split";

const SYSTEM_PROMPT = `Du liest Kassenzettel-Fotos (Schweiz/EU) und extrahierst strukturierte Daten.
Antworte NUR mit gültigem JSON (kein Markdown) in genau diesem Schema:
{
  "merchant": string,
  "datetime": string|null (ISO wenn möglich),
  "date": string|null (YYYY-MM-DD),
  "time": string|null (HH:MM),
  "card_type": string|null (z.B. Visa, Mastercard, Maestro, TWINT),
  "payment_last4": string|null,
  "payment_method": string|null (cash|debit|credit|twint|transfer|other),
  "currency": "CHF"|"EUR"|"USD",
  "total": number|null,
  "items": [{"name": string, "quantity": number, "unit_price": number, "line_total": number}],
  "raw_text": string|null
}
Regeln:
- Lies alle sichtbaren Artikelpositionen mit Menge und Preis.
- Ignoriere Zwischensummen, MwSt-Zeilen, Wechselgeld, Bonuskarten-Punkte.
- unit_price ist der Preis pro Stück; line_total = quantity * unit_price wenn erkennbar.
- Wenn Menge fehlt: quantity=1.
- Beträge als Dezimalzahlen mit Punkt.
- raw_text: kurzer mitgelesener Klartext des Belegs (optional).`;

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

async function callOpenAI(body: Record<string, unknown>): Promise<ParsedReceipt> {
  const apiKey = requireApiKey();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolveModel(),
      temperature: 0,
      response_format: { type: "json_object" },
      ...body,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI fehlgeschlagen: ${res.status} ${errBody}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI: leere Antwort");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new Error("OpenAI: ungültiges JSON");
  }

  return parsedReceiptSchema.parse(raw);
}

/** Belegfoto direkt an OpenAI Vision — OCR + Struktur in einem Call. */
export async function parseReceiptImageWithOpenAI(
  imageBytes: Buffer,
  mimeType = "image/jpeg"
): Promise<{ parsed: ParsedReceipt; rawText: string }> {
  const mime =
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    mimeType === "image/gif" ||
    mimeType === "image/jpeg"
      ? mimeType
      : "image/jpeg";

  const dataUrl = `data:${mime};base64,${imageBytes.toString("base64")}`;
  const detail =
    process.env.OPENAI_VISION_DETAIL === "low" ? "low" : "high";

  const parsed = await callOpenAI({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analysiere diesen Kassenzettel und gib das JSON-Schema zurück.",
          },
          {
            type: "image_url",
            image_url: { url: dataUrl, detail },
          },
        ],
      },
    ],
  });

  const rawText =
    typeof (parsed as { raw_text?: unknown }).raw_text === "string"
      ? String((parsed as { raw_text?: string }).raw_text)
      : [
          parsed.merchant,
          parsed.date,
          parsed.time,
          ...parsed.items.map(
            (i) => `${i.quantity}x ${i.name} ${i.unit_price}`
          ),
          parsed.total != null ? `Total ${parsed.total}` : null,
        ]
          .filter(Boolean)
          .join("\n");

  return { parsed, rawText };
}

/** Fallback: nur Text (z.B. wenn schon OCR-Text vorliegt). */
export async function parseReceiptTextWithOpenAI(
  ocrText: string
): Promise<ParsedReceipt> {
  return callOpenAI({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `OCR-Text des Belegs:\n\n${ocrText.slice(0, 12000)}`,
      },
    ],
  });
}

export function parsedReceiptToSplitDraft(parsed: ParsedReceipt): SplitData {
  const items = parsed.items.map((item, index) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const unit_price = roundMoney(Number(item.unit_price) || 0);
    const total = roundMoney(
      item.line_total != null
        ? Number(item.line_total)
        : lineTotal(quantity, unit_price)
    );
    return {
      id: `item-${index + 1}`,
      name: item.name,
      quantity,
      unit_price,
      line_total: total,
      assignments: defaultAssignments(quantity),
    };
  });

  const totals = computeSplitTotals(items, parsed.total ?? null);

  return {
    persons: ["Carlo", "David"],
    merchant_meta: {
      merchant: parsed.merchant || "Unbekannt",
      datetime: parsed.datetime ?? null,
      date: parsed.date ?? null,
      time: parsed.time ?? null,
      card_type: parsed.card_type ?? null,
      payment_last4: parsed.payment_last4 ?? null,
      payment_method: parsed.payment_method ?? null,
      currency: parsed.currency ?? "CHF",
      total: parsed.total ?? totals.receipt,
    },
    items,
    totals,
  };
}
