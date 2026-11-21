import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

let ensurePromise: Promise<void> | null = null;

/** Idempotent schema patches so deploys don't crash before ensure-*.sh runs. */
export function ensureSchema() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const db = getDb();
      await db.execute(sql`
        ALTER TABLE transactions
          ADD COLUMN IF NOT EXISTS ai_tips jsonb
      `);
      await db.execute(sql`
        ALTER TABLE transactions
          ADD COLUMN IF NOT EXISTS ai_tips_status text
      `);
      await db.execute(sql`
        ALTER TABLE transactions
          ADD COLUMN IF NOT EXISTS split_data jsonb
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS household_budgets (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount numeric(12,2) NOT NULL,
          currency text NOT NULL DEFAULT 'CHF',
          month date NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS household_budgets_user_month_idx
          ON household_budgets (user_id, month)
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS expense_tips_reports (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          month date NOT NULL,
          summary text NOT NULL DEFAULT '',
          tips jsonb NOT NULL DEFAULT '[]'::jsonb,
          estimated_monthly_savings numeric(12,2) NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS expense_tips_reports_user_month_idx
          ON expense_tips_reports (user_id, month)
      `);
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  return ensurePromise;
}
