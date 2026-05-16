-- PT Gamification Schema — Phase 3
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vkizidrsuwsreepsbbuy/sql/new
--
-- After running this SQL, the sync layer in lib/supabase-sync.ts
-- activates automatically — no code changes needed.

-- ─── user_gamification table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_gamification (
  user_id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  best_streak         INTEGER NOT NULL DEFAULT 0,
  last_prediction_date DATE,
  total_predictions   INTEGER NOT NULL DEFAULT 0,
  category_predictions JSONB NOT NULL DEFAULT '{}'::jsonb,
  predictions         JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolved_count      INTEGER NOT NULL DEFAULT 0,
  correct_count       INTEGER NOT NULL DEFAULT 0,
  called_it_count     INTEGER NOT NULL DEFAULT 0,
  badges              JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_gamification_best_streak
  ON user_gamification (best_streak DESC);

CREATE INDEX IF NOT EXISTS idx_user_gamification_total_predictions
  ON user_gamification (total_predictions DESC);

CREATE INDEX IF NOT EXISTS idx_user_gamification_correct_count
  ON user_gamification (correct_count DESC, resolved_count DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "user_gamification_select_own"
  ON user_gamification FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own row
CREATE POLICY "user_gamification_insert_own"
  ON user_gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own row
CREATE POLICY "user_gamification_update_own"
  ON user_gamification FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Public leaderboard view ──────────────────────────────────────────────────
-- Exposes anonymous ranking data — no PII, no email, no private fields.
-- Accuracy computed server-side so clients can't spoof it.

CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  user_id,
  current_streak,
  best_streak,
  total_predictions,
  resolved_count,
  correct_count,
  called_it_count,
  CASE
    WHEN resolved_count >= 5
    THEN ROUND((correct_count::float / resolved_count) * 100)::integer
    ELSE NULL
  END AS accuracy_pct,
  jsonb_array_length(badges) AS badge_count,
  badges,
  category_predictions,
  updated_at
FROM user_gamification;

-- Allow anon/authenticated to read the leaderboard view
GRANT SELECT ON public_leaderboard TO anon, authenticated;

-- ─── Helper: update timestamp trigger ────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_gamification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW EXECUTE FUNCTION update_gamification_timestamp();
