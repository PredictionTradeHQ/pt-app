-- PT Migration 000 — wallets table
-- Run FIRST in the Supabase SQL Editor (new clean project):
-- https://supabase.com/dashboard/project/vkizidrsuwsreepsbbuy/sql/new
--
-- Creates the wallets table which stores each user's virtual balance ($100,000 starting).
-- Required before migration 004 (demo_portfolios) which adds an UPDATE policy to this table.

CREATE TABLE IF NOT EXISTS wallets (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance    NUMERIC NOT NULL DEFAULT 100000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_select_own"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "wallets_insert_own"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallet_update_own"
  ON wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
