-- Migration 004: demo_portfolios table + wallets RLS hardening
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vkizidrsuwsreepsbbuy/sql/new
--
-- Fixes: bet positions and activity disappearing on page refresh
-- Root cause: demo_portfolios table was never created → PUT /api/demo-portfolio returned 500 silently

-- ─── demo_portfolios ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_portfolios (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance         NUMERIC NOT NULL DEFAULT 100000,
  positions       JSONB NOT NULL DEFAULT '[]'::jsonb,
  activity        JSONB NOT NULL DEFAULT '[]'::jsonb,
  starting_balance NUMERIC NOT NULL DEFAULT 100000,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE demo_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_portfolios_select_own"
  ON demo_portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "demo_portfolios_insert_own"
  ON demo_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "demo_portfolios_update_own"
  ON demo_portfolios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── wallets: ensure UPDATE policy exists ─────────────────────────────────────
-- Safe to run even if policy already exists — DO block checks first.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'wallets'
      AND policyname = 'wallet_update_own'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "wallet_update_own"
        ON wallets FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    $policy$;
  END IF;
END$$;
