import { randomUUID } from "crypto";
import type { Category, Transaction } from "@/types/database";
import { DEMO_USER_ID } from "@/lib/demo/mode";

type DemoStore = {
  categories: Category[];
  transactions: Transaction[];
};

const globalForDemo = globalThis as typeof globalThis & {
  __expenseDemoStore?: DemoStore;
};

const DEFAULT_CATEGORIES: Omit<
  Category,
  "id" | "user_id" | "created_at" | "updated_at"
>[] = [
  { name: "Lebensmittel", icon: "shopping-basket", color: "#22c55e", is_default: true },
  { name: "Restaurants & Takeaway", icon: "utensils", color: "#f97316", is_default: true },
  { name: "Getränke & Snacks", icon: "coffee", color: "#eab308", is_default: true },
  { name: "Transport & Mobilität", icon: "bus", color: "#3b82f6", is_default: true },
  { name: "Auto", icon: "car", color: "#64748b", is_default: true },
  { name: "Wohnen", icon: "home", color: "#8b5cf6", is_default: true },
  { name: "Versicherungen", icon: "shield", color: "#06b6d4", is_default: true },
  { name: "Gesundheit", icon: "heart-pulse", color: "#ef4444", is_default: true },
  { name: "Kleidung", icon: "shirt", color: "#ec4899", is_default: true },
  { name: "Elektronik & Technik", icon: "cpu", color: "#14b8a6", is_default: true },
  { name: "Freizeit", icon: "gamepad-2", color: "#a855f7", is_default: true },
  { name: "Reisen", icon: "plane", color: "#0ea5e9", is_default: true },
  { name: "Abonnements", icon: "repeat", color: "#84cc16", is_default: true },
  { name: "Shopping", icon: "shopping-bag", color: "#f43f5e", is_default: true },
  { name: "Sonstiges", icon: "more-horizontal", color: "#94a3b8", is_default: true },
];

function nowIso() {
  return new Date().toISOString();
}

function monthDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function createSeedStore(): DemoStore {
  const created = nowIso();
  const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
    id: randomUUID(),
    user_id: DEMO_USER_ID,
    created_at: created,
    updated_at: created,
    ...cat,
  }));

  const byName = (name: string) =>
    categories.find((c) => c.name === name)?.id ?? categories[0].id;

  const transactions: Transaction[] = [
    {
      id: randomUUID(),
      user_id: DEMO_USER_ID,
      category_id: byName("Lebensmittel"),
      amount: 86.4,
      currency: "CHF",
      date: monthDate(2),
      merchant: "Migros",
      description: "Wocheneinkauf",
      justification: "Lebensmittel für die Woche",
      subcategory: null,
      payment_method: "debit",
      location: "Zürich",
      is_recurring: false,
      scope: "private",
      notes: null,
      necessity: "necessary",
      purchase_type: "planned",
      satisfaction: "satisfied",
      split_data: null,
      ai_tips: null,
      ai_tips_status: null,
      created_at: created,
      updated_at: created,
    },
    {
      id: randomUUID(),
      user_id: DEMO_USER_ID,
      category_id: byName("Restaurants & Takeaway"),
      amount: 42.5,
      currency: "CHF",
      date: monthDate(4),
      merchant: "Uber Eats",
      description: "Abendessen bestellt",
      justification: "Keine Zeit zum Kochen",
      subcategory: null,
      payment_method: "credit",
      location: null,
      is_recurring: false,
      scope: "private",
      notes: null,
      necessity: "optional",
      purchase_type: "spontaneous",
      satisfaction: "neutral",
      split_data: null,
      ai_tips: null,
      ai_tips_status: null,
      created_at: created,
      updated_at: created,
    },
    {
      id: randomUUID(),
      user_id: DEMO_USER_ID,
      category_id: byName("Abonnements"),
      amount: 15.9,
      currency: "CHF",
      date: monthDate(8),
      merchant: "Netflix",
      description: "Monatsabo",
      justification: "Streaming Abo",
      subcategory: null,
      payment_method: "credit",
      location: null,
      is_recurring: true,
      scope: "private",
      notes: null,
      necessity: "optional",
      purchase_type: "planned",
      satisfaction: "satisfied",
      split_data: null,
      ai_tips: null,
      ai_tips_status: null,
      created_at: created,
      updated_at: created,
    },
    {
      id: randomUUID(),
      user_id: DEMO_USER_ID,
      category_id: byName("Transport & Mobilität"),
      amount: 78.0,
      currency: "CHF",
      date: monthDate(12),
      merchant: "SBB",
      description: "Halbtax Monat",
      justification: "Pendeln zur Arbeit",
      subcategory: null,
      payment_method: "twint",
      location: null,
      is_recurring: true,
      scope: "private",
      notes: null,
      necessity: "necessary",
      purchase_type: "planned",
      satisfaction: "satisfied",
      split_data: null,
      ai_tips: null,
      ai_tips_status: null,
      created_at: created,
      updated_at: created,
    },
    {
      id: randomUUID(),
      user_id: DEMO_USER_ID,
      category_id: byName("Shopping"),
      amount: 129.0,
      currency: "CHF",
      date: monthDate(6),
      merchant: "Zalando",
      description: "Sneaker",
      justification: "Spontaner Kauf ohne wirklichen Bedarf",
      subcategory: null,
      payment_method: "credit",
      location: null,
      is_recurring: false,
      scope: "private",
      notes: null,
      necessity: "unnecessary",
      purchase_type: "impulse",
      satisfaction: "regret",
      split_data: null,
      ai_tips: null,
      ai_tips_status: null,
      created_at: created,
      updated_at: created,
    },
    {
      id: randomUUID(),
      user_id: DEMO_USER_ID,
      category_id: byName("Restaurants & Takeaway"),
      amount: 64.0,
      currency: "CHF",
      date: monthDate(35),
      merchant: "Restaurant Bindella",
      description: "Abendessen mit Freunden",
      justification: "Geplanter Abend",
      subcategory: null,
      payment_method: "debit",
      location: "Zürich",
      is_recurring: false,
      scope: "private",
      notes: null,
      necessity: "sensible",
      purchase_type: "planned",
      satisfaction: "very_satisfied",
      split_data: null,
      ai_tips: null,
      ai_tips_status: null,
      created_at: created,
      updated_at: created,
    },
    {
      id: randomUUID(),
      user_id: DEMO_USER_ID,
      category_id: byName("Lebensmittel"),
      amount: 102.3,
      currency: "CHF",
      date: monthDate(40),
      merchant: "Coop",
      description: "Wocheneinkauf",
      justification: "Lebensmittel",
      subcategory: null,
      payment_method: "debit",
      location: null,
      is_recurring: false,
      scope: "private",
      notes: null,
      necessity: "necessary",
      purchase_type: "planned",
      satisfaction: "satisfied",
      split_data: null,
      ai_tips: null,
      ai_tips_status: null,
      created_at: created,
      updated_at: created,
    },
  ];

  return { categories, transactions };
}

export function getDemoStore(): DemoStore {
  if (!globalForDemo.__expenseDemoStore) {
    globalForDemo.__expenseDemoStore = createSeedStore();
  }
  return globalForDemo.__expenseDemoStore;
}

export function listDemoCategories() {
  return [...getDemoStore().categories].sort((a, b) =>
    a.name.localeCompare(b.name, "de")
  );
}

export function listDemoTransactions() {
  return [...getDemoStore().transactions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export function getDemoTransaction(id: string) {
  return getDemoStore().transactions.find((tx) => tx.id === id) ?? null;
}

export function createDemoTransaction(
  input: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
) {
  const stamp = nowIso();
  const tx: Transaction = {
    ...input,
    id: randomUUID(),
    user_id: DEMO_USER_ID,
    created_at: stamp,
    updated_at: stamp,
  };
  getDemoStore().transactions.unshift(tx);
  return tx;
}

export function updateDemoTransaction(
  id: string,
  input: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
) {
  const store = getDemoStore();
  const index = store.transactions.findIndex((tx) => tx.id === id);
  if (index === -1) return null;

  const existing = store.transactions[index];
  const updated: Transaction = {
    ...existing,
    ...input,
    id: existing.id,
    user_id: existing.user_id,
    created_at: existing.created_at,
    updated_at: nowIso(),
  };
  store.transactions[index] = updated;
  return updated;
}

export function deleteDemoTransaction(id: string) {
  const store = getDemoStore();
  const before = store.transactions.length;
  store.transactions = store.transactions.filter((tx) => tx.id !== id);
  return store.transactions.length < before;
}

export function withDemoCategories(transactions: Transaction[]) {
  const categories = getDemoStore().categories;
  return transactions.map((tx) => ({
    ...tx,
    categories: categories.find((c) => c.id === tx.category_id) ?? null,
  }));
}
