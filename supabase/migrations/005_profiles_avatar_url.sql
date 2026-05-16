-- 005_profiles_avatar_url.sql
-- Adds avatar_url to public profiles. Source of truth for whether a user has
-- uploaded a profile photo. URLs point at public objects in the `avatars`
-- Supabase Storage bucket (see migration 006 for bucket + RLS setup).
--
-- Idempotent: safe to re-run.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.profiles.avatar_url IS
  'Public URL of the user''s uploaded avatar in the `avatars` Supabase Storage bucket. NULL → render initials fallback.';
