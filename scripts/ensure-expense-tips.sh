#!/usr/bin/env bash
set -euo pipefail
cd /var/www/finance-tracker
set -a
# shellcheck disable=SC1091
source .env.local
set +a
psql "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS expense_tips_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month date NOT NULL,
  summary text NOT NULL DEFAULT '',
  tips jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_monthly_savings numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS expense_tips_reports_user_month_idx
  ON expense_tips_reports (user_id, month);

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS ai_tips jsonb;
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS ai_tips_status text;
SQL
echo EXPENSE_TIPS_OK
