export type Currency = "CHF" | "EUR" | "USD";

export type Necessity = "necessary" | "sensible" | "optional" | "unnecessary";

export type PurchaseType = "planned" | "spontaneous" | "impulse" | "emergency";

export type Satisfaction =
  | "very_satisfied"
  | "satisfied"
  | "neutral"
  | "unsatisfied"
  | "regret";

export type PaymentMethod =
  | "cash"
  | "debit"
  | "credit"
  | "twint"
  | "transfer"
  | "other";

export type ExpenseScope = "private" | "business";

export type RecurringInterval = "monthly" | "quarterly" | "yearly";

export type SplitPerson = "Carlo" | "David";

export interface ReceiptSplitItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  assignments: { Carlo: number; David: number };
}

export interface ReceiptSplitData {
  persons: ["Carlo", "David"];
  merchant_meta: {
    merchant: string;
    datetime?: string | null;
    date?: string | null;
    time?: string | null;
    card_type?: string | null;
    payment_last4?: string | null;
    payment_method?: string | null;
    currency?: Currency;
    total?: number | null;
  };
  items: ReceiptSplitItem[];
  totals: { Carlo: number; David: number; receipt: number };
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  currency: Currency;
  date: string;
  merchant: string;
  description: string;
  justification: string;
  subcategory: string | null;
  payment_method: PaymentMethod | null;
  location: string | null;
  is_recurring: boolean;
  scope: ExpenseScope;
  notes: string | null;
  necessity: Necessity | null;
  purchase_type: PurchaseType | null;
  satisfaction: Satisfaction | null;
  split_data: ReceiptSplitData | null;
  ai_tips: ExpenseTip[] | null;
  ai_tips_status: "pending" | "done" | "error" | null;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency: Currency;
  month: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdBudget {
  id: string;
  user_id: string;
  amount: number;
  currency: Currency;
  month: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  category_id: string | null;
  merchant: string;
  amount: number;
  currency: Currency;
  interval: RecurringInterval;
  next_payment_date: string | null;
  cancellation_notice_days: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  transaction_id: string | null;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  content_hash: string | null;
  ocr_raw_text: string | null;
  ocr_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsOpportunity {
  id: string;
  user_id: string;
  title: string;
  description: string;
  affected_transaction_ids: string[];
  monthly_cost: number;
  suggested_action: string;
  monthly_savings: number;
  yearly_savings: number;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export type ExpenseTipSeverity =
  | "unnecessary"
  | "questionable"
  | "ok";

export type ExpenseTipRoastSeverity = "waste" | "questionable" | "ok";

export interface ExpenseTip {
  transaction_id: string | null;
  merchant: string;
  item: string | null;
  title?: string;
  why?: string;
  instead?: string;
  how?: string[];
  reason: string;
  alternative: string;
  severity: ExpenseTipSeverity;
  tip_severity?: ExpenseTipRoastSeverity;
  necessity: Necessity;
  estimated_savings: number;
  priority: "low" | "medium" | "high";
}

export interface ExpenseTipsReport {
  id: string;
  user_id: string;
  month: string;
  summary: string;
  tips: ExpenseTip[];
  estimated_monthly_savings: number;
  pending_count: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionNote {
  id: string;
  user_id: string;
  transaction_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCategory extends Transaction {
  categories: Category | null;
}
