-- PT Migration 003 — Extend public_leaderboard view with predictions array
-- Enables server-side category accuracy computation on public profiles.
--
-- Run once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dvevwlhshcyvnsubyvzw/sql/new
--
-- WHAT THIS DOES:
-- Recreates public_leaderboard to include the full predictions JSONB column.
-- The route /api/profile/[username] uses this to compute:
--   - category accuracy (per category win rate, min 3 resolved)
--   - top contrarian calls (correct predictions against the crowd)
-- The leaderboard route /api/leaderboard/forecasters only selects specific
-- columns and is unaffected — no extra data is fetched there.
--
-- WHY THIS IS SAFE:
-- user_gamification contains no PII. All fields are game stats:
-- streaks, prediction records (market titles + outcomes), badges.
-- The view is already public via GRANT; this only adds the predictions column.

CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  user_id,
  current_streak,
  best_streak,
  last_prediction_date,
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
  predictions,
  updated_at
FROM user_gamification;

-- Re-apply grant after recreating the view
GRANT SELECT ON public_leaderboard TO anon, authenticated;
