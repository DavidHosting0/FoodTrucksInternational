#!/usr/bin/env bash
set -euo pipefail
cd /var/www/finance-tracker
set -a
# shellcheck disable=SC1091
source .env.local
set +a
psql "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS household_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'CHF',
  month date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS household_budgets_user_month_idx
  ON household_budgets (user_id, month);
SQL
echo HOUSEHOLD_BUDGETS_OK
