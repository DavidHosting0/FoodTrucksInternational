import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import {
  mapBudget,
  mapCategory,
  mapReceipt,
  mapRecurring,
  mapSavings,
  mapTransaction,
} from "@/lib/db/mappers";
import {
  budgets,
  categories,
  expenseTipsReports,
  householdBudgets,
  receipts,
  recurringExpenses,
  savingsOpportunities,
  transactions,
} from "@/lib/db/schema";
import {
  createDemoTransaction,
  deleteDemoTransaction,
  getDemoTransaction,
  listDemoCategories,
  listDemoTransactions,
  updateDemoTransaction,
  withDemoCategories,
} from "@/lib/demo/store";
import { DEMO_USER_ID, isDemoMode } from "@/lib/demo/mode";
import type {
  Budget,
  Category,
  ExpenseTip,
  ExpenseTipsReport,
  HouseholdBudget,
  Necessity,
  Receipt,
  RecurringExpense,
  SavingsOpportunity,
  Transaction,
  TransactionWithCategory,
} from "@/types/database";

export async function requireUserId() {
  if (isDemoMode()) {
    return DEMO_USER_ID;
  }

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Nicht angemeldet");
  }
  return session.user.id;
}

export async function getCategories(): Promise<Category[]> {
  if (isDemoMode()) {
    return listDemoCategories();
  }

  const db = getDb();
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
  return rows.map(mapCategory);
}

export async function getTransactions(): Promise<TransactionWithCategory[]> {
  if (isDemoMode()) {
    return withDemoCategories(listDemoTransactions());
  }

  const db = getDb();
  const userId = await requireUserId();
  const rows = await db
    .select({
      transaction: transactions,
      category: categories,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  return rows.map((row) =>
    mapTransaction(row.transaction, row.category)
  ) as TransactionWithCategory[];
}

export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  if (isDemoMode()) {
    return getDemoTransaction(id);
  }

  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1);

  return row ? (mapTransaction(row) as Transaction) : null;
}

export async function insertTransaction(
  payload: Omit<Transaction, "id" | "created_at" | "updated_at" | "categories">
) {
  if (isDemoMode()) {
    const { user_id: _userId, ...rest } = payload;
    return createDemoTransaction(rest);
  }

  const db = getDb();
  const [row] = await db
    .insert(transactions)
    .values({
      userId: payload.user_id,
      categoryId: payload.category_id,
      amount: String(payload.amount),
      currency: payload.currency,
      date: payload.date,
      merchant: payload.merchant,
      description: payload.description,
      justification: payload.justification,
      subcategory: payload.subcategory,
      paymentMethod: payload.payment_method,
      location: payload.location,
      isRecurring: payload.is_recurring,
      scope: payload.scope,
      notes: payload.notes,
      necessity: payload.necessity,
      purchaseType: payload.purchase_type,
      satisfaction: payload.satisfaction,
      splitData: payload.split_data ?? null,
    })
    .returning();

  return mapTransaction(row) as Transaction;
}

export async function patchTransaction(
  id: string,
  payload: Omit<Transaction, "id" | "created_at" | "updated_at" | "categories">
) {
  if (isDemoMode()) {
    const { user_id: _userId, ...rest } = payload;
    const updated = updateDemoTransaction(id, rest);
    if (!updated) throw new Error("Transaktion nicht gefunden");
    return updated;
  }

  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .update(transactions)
    .set({
      categoryId: payload.category_id,
      amount: String(payload.amount),
      currency: payload.currency,
      date: payload.date,
      merchant: payload.merchant,
      description: payload.description,
      justification: payload.justification,
      subcategory: payload.subcategory,
      paymentMethod: payload.payment_method,
      location: payload.location,
      isRecurring: payload.is_recurring,
      scope: payload.scope,
      notes: payload.notes,
      necessity: payload.necessity,
      purchaseType: payload.purchase_type,
      satisfaction: payload.satisfaction,
      splitData: payload.split_data ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();

  if (!row) throw new Error("Transaktion nicht gefunden");
  return mapTransaction(row) as Transaction;
}

export async function removeTransaction(id: string) {
  if (isDemoMode()) {
    const ok = deleteDemoTransaction(id);
    if (!ok) throw new Error("Transaktion nicht gefunden");
    return;
  }

  const db = getDb();
  const userId = await requireUserId();
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function createCategory(input: {
  name: string;
  icon?: string | null;
  color?: string | null;
}) {
  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .insert(categories)
    .values({
      userId,
      name: input.name.trim(),
      icon: input.icon ?? null,
      color: input.color ?? "#94a3b8",
      isDefault: false,
    })
    .returning();
  return mapCategory(row);
}

export async function updateCategory(
  id: string,
  input: { name: string; icon?: string | null; color?: string | null }
) {
  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .update(categories)
    .set({
      name: input.name.trim(),
      icon: input.icon ?? null,
      color: input.color ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  if (!row) throw new Error("Kategorie nicht gefunden");
  return mapCategory(row);
}

export async function deleteCategory(id: string) {
  const db = getDb();
  const userId = await requireUserId();
  const [existing] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1);
  if (!existing) throw new Error("Kategorie nicht gefunden");
  if (existing.isDefault) {
    throw new Error("Standard-Kategorien können nicht gelöscht werden");
  }
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function getBudgets(month: string): Promise<
  (Budget & { categories?: Category | null })[]
> {
  if (isDemoMode()) return [];

  const db = getDb();
  const userId = await requireUserId();
  const monthStart = `${month.slice(0, 7)}-01`;
  const rows = await db
    .select({ budget: budgets, category: categories })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(and(eq(budgets.userId, userId), eq(budgets.month, monthStart)));
  return rows.map((r) => mapBudget(r.budget, r.category));
}

export async function upsertBudget(input: {
  category_id: string;
  amount: number;
  currency: string;
  month: string;
}) {
  const db = getDb();
  const userId = await requireUserId();
  const monthStart = `${input.month.slice(0, 7)}-01`;

  const [existing] = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.categoryId, input.category_id),
        eq(budgets.month, monthStart)
      )
    )
    .limit(1);

  if (existing) {
    const [row] = await db
      .update(budgets)
      .set({
        amount: String(input.amount),
        currency: input.currency,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, existing.id))
      .returning();
    return mapBudget(row);
  }

  const [row] = await db
    .insert(budgets)
    .values({
      userId,
      categoryId: input.category_id,
      amount: String(input.amount),
      currency: input.currency,
      month: monthStart,
    })
    .returning();
  return mapBudget(row);
}

export async function deleteBudget(id: string) {
  const db = getDb();
  const userId = await requireUserId();
  await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
}

export async function getHouseholdBudget(
  month: string
): Promise<HouseholdBudget | null> {
  if (isDemoMode()) return null;

  const db = getDb();
  const userId = await requireUserId();
  const monthStart = `${month.slice(0, 7)}-01`;
  const [row] = await db
    .select()
    .from(householdBudgets)
    .where(
      and(
        eq(householdBudgets.userId, userId),
        eq(householdBudgets.month, monthStart)
      )
    )
    .limit(1);

  if (!row) return null;
  return {
    id: row.id,
    user_id: row.userId,
    amount: Number(row.amount),
    currency: row.currency as HouseholdBudget["currency"],
    month: row.month,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export async function upsertHouseholdBudget(input: {
  amount: number;
  currency: string;
  month: string;
}) {
  const db = getDb();
  const userId = await requireUserId();
  const monthStart = `${input.month.slice(0, 7)}-01`;

  const [existing] = await db
    .select()
    .from(householdBudgets)
    .where(
      and(
        eq(householdBudgets.userId, userId),
        eq(householdBudgets.month, monthStart)
      )
    )
    .limit(1);

  if (existing) {
    const [row] = await db
      .update(householdBudgets)
      .set({
        amount: String(input.amount),
        currency: input.currency,
        updatedAt: new Date(),
      })
      .where(eq(householdBudgets.id, existing.id))
      .returning();
    return {
      id: row.id,
      user_id: row.userId,
      amount: Number(row.amount),
      currency: row.currency as HouseholdBudget["currency"],
      month: row.month,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    };
  }

  const [row] = await db
    .insert(householdBudgets)
    .values({
      userId,
      amount: String(input.amount),
      currency: input.currency,
      month: monthStart,
    })
    .returning();

  return {
    id: row.id,
    user_id: row.userId,
    amount: Number(row.amount),
    currency: row.currency as HouseholdBudget["currency"],
    month: row.month,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export async function getRecurringExpenses(): Promise<
  (RecurringExpense & { categories?: Category | null })[]
> {
  if (isDemoMode()) return [];

  const db = getDb();
  const userId = await requireUserId();
  const rows = await db
    .select({ expense: recurringExpenses, category: categories })
    .from(recurringExpenses)
    .leftJoin(categories, eq(recurringExpenses.categoryId, categories.id))
    .where(eq(recurringExpenses.userId, userId))
    .orderBy(recurringExpenses.merchant);
  return rows.map((r) => mapRecurring(r.expense, r.category));
}

export async function insertRecurringExpense(input: {
  merchant: string;
  amount: number;
  currency: string;
  interval: string;
  category_id?: string | null;
  next_payment_date?: string | null;
  cancellation_notice_days?: number | null;
  notes?: string | null;
  is_active?: boolean;
}) {
  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .insert(recurringExpenses)
    .values({
      userId,
      merchant: input.merchant.trim(),
      amount: String(input.amount),
      currency: input.currency,
      interval: input.interval,
      categoryId: input.category_id || null,
      nextPaymentDate: input.next_payment_date || null,
      cancellationNoticeDays: input.cancellation_notice_days ?? null,
      notes: input.notes ?? null,
      isActive: input.is_active ?? true,
    })
    .returning();
  return mapRecurring(row);
}

export async function updateRecurringExpense(
  id: string,
  input: {
    merchant: string;
    amount: number;
    currency: string;
    interval: string;
    category_id?: string | null;
    next_payment_date?: string | null;
    cancellation_notice_days?: number | null;
    notes?: string | null;
    is_active?: boolean;
  }
) {
  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .update(recurringExpenses)
    .set({
      merchant: input.merchant.trim(),
      amount: String(input.amount),
      currency: input.currency,
      interval: input.interval,
      categoryId: input.category_id || null,
      nextPaymentDate: input.next_payment_date || null,
      cancellationNoticeDays: input.cancellation_notice_days ?? null,
      notes: input.notes ?? null,
      isActive: input.is_active ?? true,
      updatedAt: new Date(),
    })
    .where(
      and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId))
    )
    .returning();
  if (!row) throw new Error("Abo nicht gefunden");
  return mapRecurring(row);
}

export async function deleteRecurringExpense(id: string) {
  const db = getDb();
  const userId = await requireUserId();
  await db
    .delete(recurringExpenses)
    .where(
      and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId))
    );
}

export async function getReceipts(): Promise<Receipt[]> {
  if (isDemoMode()) return [];

  const db = getDb();
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(receipts)
    .where(eq(receipts.userId, userId))
    .orderBy(desc(receipts.createdAt));
  return rows.map(mapReceipt);
}

export async function insertReceipt(input: {
  file_path: string;
  file_name: string;
  file_type: string;
  file_size?: number | null;
  content_hash?: string | null;
  transaction_id?: string | null;
  ocr_raw_text?: string | null;
  ocr_data?: Record<string, unknown> | null;
}) {
  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .insert(receipts)
    .values({
      userId,
      filePath: input.file_path,
      fileName: input.file_name,
      fileType: input.file_type,
      fileSize: input.file_size ?? null,
      contentHash: input.content_hash ?? null,
      transactionId: input.transaction_id ?? null,
      ocrRawText: input.ocr_raw_text ?? null,
      ocrData: input.ocr_data ?? null,
    })
    .returning();
  return mapReceipt(row);
}

export async function linkReceiptToTransaction(
  receiptId: string,
  transactionId: string | null
) {
  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .update(receipts)
    .set({ transactionId, updatedAt: new Date() })
    .where(and(eq(receipts.id, receiptId), eq(receipts.userId, userId)))
    .returning();
  if (!row) throw new Error("Beleg nicht gefunden");
  return mapReceipt(row);
}

export async function deleteReceipt(id: string) {
  const db = getDb();
  const userId = await requireUserId();
  const [row] = await db
    .select()
    .from(receipts)
    .where(and(eq(receipts.id, id), eq(receipts.userId, userId)))
    .limit(1);
  if (!row) throw new Error("Beleg nicht gefunden");
  await db
    .delete(receipts)
    .where(and(eq(receipts.id, id), eq(receipts.userId, userId)));
  return row.filePath;
}

export async function getSavingsOpportunities(): Promise<SavingsOpportunity[]> {
  if (isDemoMode()) return [];

  const db = getDb();
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(savingsOpportunities)
    .where(eq(savingsOpportunities.userId, userId))
    .orderBy(desc(savingsOpportunities.yearlySavings));
  return rows.map(mapSavings);
}

export async function replaceSavingsOpportunities(
  items: Omit<
    SavingsOpportunity,
    "id" | "user_id" | "created_at" | "updated_at"
  >[]
) {
  const db = getDb();
  const userId = await requireUserId();
  await db
    .delete(savingsOpportunities)
    .where(eq(savingsOpportunities.userId, userId));

  if (items.length === 0) return [];

  const rows = await db
    .insert(savingsOpportunities)
    .values(
      items.map((item) => ({
        userId,
        title: item.title,
        description: item.description,
        affectedTransactionIds: item.affected_transaction_ids,
        monthlyCost: String(item.monthly_cost),
        suggestedAction: item.suggested_action,
        monthlySavings: String(item.monthly_savings),
        yearlySavings: String(item.yearly_savings),
        priority: item.priority,
      }))
    )
    .returning();

  return rows.map(mapSavings);
}

function mapExpenseTipsReport(row: {
  id: string;
  userId: string;
  month: string;
  summary: string;
  tips: unknown;
  estimatedMonthlySavings: string;
  createdAt: Date;
  updatedAt: Date;
}): ExpenseTipsReport {
  return {
    id: row.id,
    user_id: row.userId,
    month: row.month,
    summary: row.summary,
    tips: (Array.isArray(row.tips) ? row.tips : []) as ExpenseTip[],
    estimated_monthly_savings: Number(row.estimatedMonthlySavings),
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export async function getExpenseTipsReport(
  month: string
): Promise<ExpenseTipsReport | null> {
  if (isDemoMode()) return null;

  const db = getDb();
  const userId = await requireUserId();
  const monthStart = `${month.slice(0, 7)}-01`;
  const [row] = await db
    .select()
    .from(expenseTipsReports)
    .where(
      and(
        eq(expenseTipsReports.userId, userId),
        eq(expenseTipsReports.month, monthStart)
      )
    )
    .limit(1);

  return row ? mapExpenseTipsReport(row) : null;
}

export async function upsertExpenseTipsReport(input: {
  month: string;
  summary: string;
  tips: ExpenseTip[];
  estimated_monthly_savings: number;
}): Promise<ExpenseTipsReport> {
  const db = getDb();
  const userId = await requireUserId();
  const monthStart = `${input.month.slice(0, 7)}-01`;

  const [existing] = await db
    .select()
    .from(expenseTipsReports)
    .where(
      and(
        eq(expenseTipsReports.userId, userId),
        eq(expenseTipsReports.month, monthStart)
      )
    )
    .limit(1);

  if (existing) {
    const [row] = await db
      .update(expenseTipsReports)
      .set({
        summary: input.summary,
        tips: input.tips,
        estimatedMonthlySavings: String(input.estimated_monthly_savings),
        updatedAt: new Date(),
      })
      .where(eq(expenseTipsReports.id, existing.id))
      .returning();
    return mapExpenseTipsReport(row);
  }

  const [row] = await db
    .insert(expenseTipsReports)
    .values({
      userId,
      month: monthStart,
      summary: input.summary,
      tips: input.tips,
      estimatedMonthlySavings: String(input.estimated_monthly_savings),
    })
    .returning();

  return mapExpenseTipsReport(row);
}

export async function updateTransactionNecessities(
  updates: Array<{ id: string; necessity: Necessity }>
) {
  if (updates.length === 0) return;
  if (isDemoMode()) {
    for (const update of updates) {
      const existing = getDemoTransaction(update.id);
      if (!existing) continue;
      const {
        id: _id,
        user_id: _userId,
        created_at: _created,
        updated_at: _updated,
        ...rest
      } = existing;
      updateDemoTransaction(update.id, {
        ...rest,
        necessity: update.necessity,
      });
    }
    return;
  }

  const db = getDb();
  const userId = await requireUserId();
  await Promise.all(
    updates.map((update) =>
      db
        .update(transactions)
        .set({
          necessity: update.necessity,
          updatedAt: new Date(),
        })
        .where(
          and(eq(transactions.id, update.id), eq(transactions.userId, userId))
        )
    )
  );
}
