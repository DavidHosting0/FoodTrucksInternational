import type {
  Budget,
  Category,
  Receipt,
  ReceiptSplitData,
  RecurringExpense,
  SavingsOpportunity,
  Transaction,
  TransactionWithCategory,
} from "@/types/database";
import type {
  BudgetRow,
  CategoryRow,
  ReceiptRow,
  RecurringExpenseRow,
  SavingsOpportunityRow,
  TransactionRow,
} from "./schema";

function num(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    user_id: row.userId,
    name: row.name,
    icon: row.icon,
    color: row.color,
    is_default: row.isDefault,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function mapTransaction(
  row: TransactionRow,
  category?: CategoryRow | null
): Transaction | TransactionWithCategory {
  const base: Transaction = {
    id: row.id,
    user_id: row.userId,
    category_id: row.categoryId,
    amount: num(row.amount),
    currency: row.currency as Transaction["currency"],
    date: row.date,
    merchant: row.merchant,
    description: row.description,
    justification: row.justification,
    subcategory: row.subcategory,
    payment_method: row.paymentMethod as Transaction["payment_method"],
    location: row.location,
    is_recurring: row.isRecurring,
    scope: row.scope as Transaction["scope"],
    notes: row.notes,
    necessity: row.necessity as Transaction["necessity"],
    purchase_type: row.purchaseType as Transaction["purchase_type"],
    satisfaction: row.satisfaction as Transaction["satisfaction"],
    split_data: (row.splitData as ReceiptSplitData | null) ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };

  if (category !== undefined) {
    return {
      ...base,
      categories: category ? mapCategory(category) : null,
    };
  }

  return base;
}

export function mapBudget(row: BudgetRow, category?: CategoryRow | null): Budget & {
  categories?: Category | null;
} {
  return {
    id: row.id,
    user_id: row.userId,
    category_id: row.categoryId,
    amount: num(row.amount),
    currency: row.currency as Budget["currency"],
    month: row.month,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    categories: category ? mapCategory(category) : null,
  };
}

export function mapRecurring(
  row: RecurringExpenseRow,
  category?: CategoryRow | null
): RecurringExpense & { categories?: Category | null } {
  return {
    id: row.id,
    user_id: row.userId,
    category_id: row.categoryId,
    merchant: row.merchant,
    amount: num(row.amount),
    currency: row.currency as RecurringExpense["currency"],
    interval: row.interval as RecurringExpense["interval"],
    next_payment_date: row.nextPaymentDate,
    cancellation_notice_days: row.cancellationNoticeDays,
    notes: row.notes,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    categories: category ? mapCategory(category) : null,
  };
}

export function mapReceipt(row: ReceiptRow): Receipt {
  return {
    id: row.id,
    user_id: row.userId,
    transaction_id: row.transactionId,
    file_path: row.filePath,
    file_name: row.fileName,
    file_type: row.fileType,
    file_size: row.fileSize,
    content_hash: row.contentHash,
    ocr_raw_text: row.ocrRawText,
    ocr_data: (row.ocrData as Record<string, unknown> | null) ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function mapSavings(row: SavingsOpportunityRow): SavingsOpportunity {
  return {
    id: row.id,
    user_id: row.userId,
    title: row.title,
    description: row.description,
    affected_transaction_ids: row.affectedTransactionIds ?? [],
    monthly_cost: num(row.monthlyCost),
    suggested_action: row.suggestedAction,
    monthly_savings: num(row.monthlySavings),
    yearly_savings: num(row.yearlySavings),
    priority: row.priority as SavingsOpportunity["priority"],
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}
