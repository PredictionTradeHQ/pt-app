-- 006_avatars_storage_setup.sql
-- Creates the `avatars` public Storage bucket and the RLS policies that let
-- each authenticated user upload / replace / delete their own avatar, while
-- everyone (including anon) can read.
--
-- Path convention: `avatars/<user_id>.<ext>` where ext ∈ {jpg, jpeg, png, webp}.
-- The split_part(name, '.', 1) check is what binds an object to its owner —
-- a user can only write a file whose basename equals their auth.uid().
--
-- Idempotent: safe to re-run.

-- ─── Bucket ───────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                                              -- public read
  5242880,                                           -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']    -- no GIF, no SVG
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── RLS policies on storage.objects ──────────────────────────────────────────

-- Drop any prior policies for this bucket so re-running cleanly replaces them.
DROP POLICY IF EXISTS "avatars_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_insert"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_update"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_delete"  ON storage.objects;

-- Public read — everyone can fetch any avatar URL.
CREATE POLICY "avatars_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Owner insert — authenticated user can upload an object whose basename
-- matches their own auth.uid().
CREATE POLICY "avatars_owner_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(name, '.', 1)
  );

-- Owner update — required for upsert (replace existing avatar).
CREATE POLICY "avatars_owner_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(name, '.', 1)
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(name, '.', 1)
  );

-- Owner delete — user can remove their own avatar.
CREATE POLICY "avatars_owner_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(name, '.', 1)
  );
