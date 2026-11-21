import type { Category } from "@/types/database";

const RULES: Array<{ category: string; patterns: RegExp[] }> = [
  {
    category: "Lebensmittel",
    patterns: [
      /\b(migros|coop|lidl|aldi|denner|spar|volg|manor food|kaufland|rewe|edeka)\b/i,
      /\b(milch|brot|nudeln|reis|gemüse|obst|fleisch|käse|joghurt|eier)\b/i,
    ],
  },
  {
    category: "Restaurants & Takeaway",
    patterns: [
      /\b(mcdonald|burger|kfc|subway|pizza|restaurant|takeaway|uber\s*eats|smood|just\s*eat|doordash)\b/i,
      /\b(menu|menü|mittagstisch|imbiss)\b/i,
    ],
  },
  {
    category: "Getränke & Snacks",
    patterns: [
      /\b(starbucks|coffee|café|cafe|kiosk|avec|selecta)\b/i,
      /\b(cola|energy|snack|chips|schoggi|schokolade)\b/i,
    ],
  },
  {
    category: "Transport & Mobilität",
    patterns: [
      /\b(sbb|öbb|vbz|zvv|bvg|uber|bolt|taxi|billet|ticket|öpnv)\b/i,
    ],
  },
  {
    category: "Auto",
    patterns: [/\b(shell|agip|bp|esso|tankstelle|parking|parkhaus|migrol)\b/i],
  },
  {
    category: "Gesundheit",
    patterns: [/\b(apotheke|pharmacy|coiffure|arzt|dental|drogerie|rossmann|dm\b)/i],
  },
  {
    category: "Kleidung",
    patterns: [/\b(h&m|zara|uniqlo|c&a|pkz|about you|zalando)\b/i],
  },
  {
    category: "Elektronik & Technik",
    patterns: [/\b(digitec|galaxus|media\s*markt|interdiscount|apple|saturn)\b/i],
  },
  {
    category: "Freizeit",
    patterns: [/\b(cinema|kino|pathé|spotify|steam|gaming|fitness|gym)\b/i],
  },
  {
    category: "Reisen",
    patterns: [/\b(booking|airbnb|hotel|flug|airline|swiss|easyjet)\b/i],
  },
  {
    category: "Shopping",
    patterns: [/\b(ikea|amazon|aliexpress|temu|manor|globus)\b/i],
  },
  {
    category: "Abonnements",
    patterns: [/\b(netflix|disney|youtube|spotify|abo|subscription)\b/i],
  },
];

export function guessCategoryId(
  categories: Category[],
  merchant: string,
  itemNames: string[] = []
): string | null {
  const haystack = [merchant, ...itemNames].join(" · ");
  for (const rule of RULES) {
    if (!rule.patterns.some((re) => re.test(haystack))) continue;
    const match = categories.find(
      (cat) => cat.name.toLowerCase() === rule.category.toLowerCase()
    );
    if (match) return match.id;
  }
  return null;
}
