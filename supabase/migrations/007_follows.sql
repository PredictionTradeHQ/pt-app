-- 007_follows.sql
-- Follow System v1 — minimal "watching forecasters" primitive.
--
-- Scope: a single edge table. No notifications, no feeds, no recommendations,
-- no denormalized counters, no materialized views. Counts are computed on
-- demand (count(*) on an indexed column) — fine until follow graph is large.
--
-- Path: public.follows (follower_id, followee_id, created_at)
--   PK composite (follower_id, followee_id)            → idempotent inserts
--   FK on auth.users(id) ON DELETE CASCADE             → account delete cleans up
--   CHECK (follower_id <> followee_id)                 → no self-follow
--   2 indexes (followee_id, follower_id)               → count + list queries
--
-- RLS:
--   SELECT public        — anyone can read counts and follow relationships
--   INSERT own follower  — authed user can only follow as themselves
--   DELETE own follower  — authed user can only unfollow on their own behalf
--
-- Idempotent: safe to re-run.

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> followee_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

-- followee_idx: count followers of a user, list followers of a user
CREATE INDEX IF NOT EXISTS follows_followee_idx
  ON public.follows(followee_id);

-- follower_idx: count following of a user, list following of a user
CREATE INDEX IF NOT EXISTS follows_follower_idx
  ON public.follows(follower_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies for clean re-run
DROP POLICY IF EXISTS follows_select_public ON public.follows;
DROP POLICY IF EXISTS follows_insert_own    ON public.follows;
DROP POLICY IF EXISTS follows_delete_own    ON public.follows;

-- Public read — needed for follower counts on profiles + leaderboard
CREATE POLICY follows_select_public
  ON public.follows
  FOR SELECT
  USING (true);

-- Insert only as yourself
CREATE POLICY follows_insert_own
  ON public.follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Delete only your own follow rows
CREATE POLICY follows_delete_own
  ON public.follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- ─── Grants ───────────────────────────────────────────────────────────────────

GRANT SELECT ON public.follows TO anon, authenticated;
GRANT INSERT, DELETE ON public.follows TO authenticated;
