import type {
  Necessity,
  PaymentMethod,
  PurchaseType,
  Satisfaction,
} from "@/types/database";

export const CURRENCIES = ["CHF", "EUR", "USD"] as const;

export const NECESSITY_OPTIONS: { value: Necessity; label: string }[] = [
  { value: "necessary", label: "Notwendig" },
  { value: "sensible", label: "Sinnvoll" },
  { value: "optional", label: "Optional" },
  { value: "unnecessary", label: "Unnötig" },
];

export const PURCHASE_TYPE_OPTIONS: { value: PurchaseType; label: string }[] = [
  { value: "planned", label: "Geplant" },
  { value: "spontaneous", label: "Spontan" },
  { value: "impulse", label: "Impulskauf" },
  { value: "emergency", label: "Notfall" },
];

export const SATISFACTION_OPTIONS: { value: Satisfaction; label: string }[] = [
  { value: "very_satisfied", label: "Sehr zufrieden" },
  { value: "satisfied", label: "Zufrieden" },
  { value: "neutral", label: "Neutral" },
  { value: "unsatisfied", label: "Unzufrieden" },
  { value: "regret", label: "Bereue den Kauf" },
];

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: "cash", label: "Bar" },
  { value: "debit", label: "Debitkarte" },
  { value: "credit", label: "Kreditkarte" },
  { value: "twint", label: "TWINT" },
  { value: "transfer", label: "Überweisung" },
  { value: "other", label: "Sonstiges" },
];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "LayoutDashboard" },
  { href: "/dashboard?tab=list", label: "Liste", icon: "List" },
  { href: "/dashboard?tab=capture", label: "Erfassen", icon: "PlusCircle" },
  { href: "/dashboard?tab=tips", label: "Tipps", icon: "Lightbulb" },
  { href: "/dashboard?tab=more", label: "Mehr", icon: "Settings" },
  { href: "/budgets", label: "Gesamtbudget", icon: "Wallet" },
  { href: "/receipts", label: "Belege", icon: "FileImage" },
  { href: "/categories", label: "Kategorien", icon: "Tags" },
  { href: "/subscriptions", label: "Abonnements", icon: "Repeat" },
  { href: "/optimization", label: "Cost Optimization", icon: "TrendingDown" },
  { href: "/reports", label: "Reports", icon: "FileText" },
  { href: "/settings", label: "Einstellungen", icon: "Settings" },
] as const;

export const SPACE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", space: "home" },
  { href: "/dashboard?tab=list", label: "Liste", space: "list" },
  { href: "/dashboard?tab=capture", label: "Erfassen", space: "capture" },
  { href: "/dashboard?tab=tips", label: "Tipps", space: "tips" },
  { href: "/dashboard?tab=more", label: "Mehr", space: "more" },
] as const;

export const MORE_NAV_ITEMS = [
  { href: "/budgets", label: "Gesamtbudget", icon: "Wallet" },
  { href: "/receipts", label: "Belege", icon: "FileImage" },
  { href: "/categories", label: "Kategorien", icon: "Tags" },
  { href: "/subscriptions", label: "Abos", icon: "Repeat" },
  { href: "/optimization", label: "Optimize", icon: "TrendingDown" },
  { href: "/reports", label: "Reports", icon: "FileText" },
  { href: "/settings", label: "Einstellungen", icon: "Settings" },
] as const;
