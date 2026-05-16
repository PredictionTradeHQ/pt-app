-- PT Profiles — Phase 4b: Real Public Profiles
-- Add username slug to profiles table for public profile URLs
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vkizidrsuwsreepsbbuy/sql/new

-- ─── Add username column ───────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Unique sparse index (only indexes rows where username IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx
  ON public.profiles (username)
  WHERE username IS NOT NULL;

-- ─── Backfill existing users ───────────────────────────────────────────────────
-- Generates a URL-safe slug from display_name.
-- Handles collisions by appending an incrementing numeric suffix.

DO $$
DECLARE
  r          RECORD;
  base_slug  TEXT;
  final_slug TEXT;
  suffix     INTEGER := 0;
BEGIN
  FOR r IN
    SELECT id, display_name
    FROM   public.profiles
    WHERE  username IS NULL
      AND  display_name IS NOT NULL
      AND  display_name <> ''
    ORDER  BY created_at ASC NULLS LAST
  LOOP
    base_slug := lower(regexp_replace(r.display_name, '[^a-z0-9]+', '-', 'g'));
    base_slug := btrim(base_slug, '-');
    IF base_slug = '' THEN
      base_slug := 'user';
    END IF;

    final_slug := base_slug;
    suffix     := 0;

    -- Increment suffix until the slug is unique
    WHILE EXISTS (
      SELECT 1 FROM public.profiles WHERE username = final_slug AND id <> r.id
    ) LOOP
      suffix     := suffix + 1;
      final_slug := base_slug || '-' || suffix;
    END LOOP;

    UPDATE public.profiles SET username = final_slug WHERE id = r.id;
  END LOOP;
END $$;

-- ─── RLS: allow public read of profiles ───────────────────────────────────────
-- Public profiles must be readable by anonymous visitors.
-- Existing SELECT policy (if any) may already cover this; this is idempotent.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own username (on profile sync)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
