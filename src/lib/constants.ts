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
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/transactions", label: "Transaktionen", icon: "List" },
  { href: "/transactions/new", label: "Ausgabe erfassen", icon: "PlusCircle" },
  { href: "/receipts", label: "Belege", icon: "FileImage" },
  { href: "/categories", label: "Kategorien", icon: "Tags" },
  { href: "/budgets", label: "Budgets", icon: "Wallet" },
  { href: "/subscriptions", label: "Abonnements", icon: "Repeat" },
  {
    href: "/optimization",
    label: "Cost Optimization",
    icon: "TrendingDown",
  },
  { href: "/reports", label: "Reports", icon: "FileText" },
  { href: "/settings", label: "Einstellungen", icon: "Settings" },
] as const;

export const MOBILE_TAB_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "LayoutDashboard" },
  { href: "/transactions", label: "Liste", icon: "List" },
  { href: "/transactions/new", label: "Plus", icon: "PlusCircle", primary: true },
  { href: "/budgets", label: "Budget", icon: "Wallet" },
  { href: "/settings", label: "Mehr", icon: "Settings" },
] as const;
