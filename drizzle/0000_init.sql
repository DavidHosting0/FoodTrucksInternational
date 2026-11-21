CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "profiles" (
  "id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "display_name" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "name" text NOT NULL,
  "icon" text,
  "color" text,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "categories_user_name_idx"
  ON "categories" ("user_id", "name");

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "category_id" uuid REFERENCES "categories"("id") ON DELETE set null,
  "amount" numeric(12, 2) NOT NULL,
  "currency" text DEFAULT 'CHF' NOT NULL,
  "date" date DEFAULT CURRENT_DATE NOT NULL,
  "merchant" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "justification" text DEFAULT '' NOT NULL,
  "subcategory" text,
  "payment_method" text,
  "location" text,
  "is_recurring" boolean DEFAULT false NOT NULL,
  "scope" text DEFAULT 'private' NOT NULL,
  "notes" text,
  "necessity" text,
  "purchase_type" text,
  "satisfaction" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "transactions_user_date_idx"
  ON "transactions" ("user_id", "date" DESC);

CREATE TABLE IF NOT EXISTS "budgets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE cascade,
  "amount" numeric(12, 2) NOT NULL,
  "currency" text DEFAULT 'CHF' NOT NULL,
  "month" date NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "budgets_user_category_month_idx"
  ON "budgets" ("user_id", "category_id", "month");

CREATE TABLE IF NOT EXISTS "recurring_expenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "category_id" uuid REFERENCES "categories"("id") ON DELETE set null,
  "merchant" text NOT NULL,
  "amount" numeric(12, 2) NOT NULL,
  "currency" text DEFAULT 'CHF' NOT NULL,
  "interval" text NOT NULL,
  "next_payment_date" date,
  "cancellation_notice_days" integer,
  "notes" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "receipts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "transaction_id" uuid REFERENCES "transactions"("id") ON DELETE set null,
  "file_path" text NOT NULL,
  "file_name" text NOT NULL,
  "file_type" text NOT NULL,
  "file_size" integer,
  "content_hash" text,
  "ocr_raw_text" text,
  "ocr_data" jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "savings_opportunities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "affected_transaction_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
  "monthly_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
  "suggested_action" text NOT NULL,
  "monthly_savings" numeric(12, 2) DEFAULT '0' NOT NULL,
  "yearly_savings" numeric(12, 2) DEFAULT '0' NOT NULL,
  "priority" text DEFAULT 'medium' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "transaction_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "transaction_id" uuid NOT NULL REFERENCES "transactions"("id") ON DELETE cascade,
  "content" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
