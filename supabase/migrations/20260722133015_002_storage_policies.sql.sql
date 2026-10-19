/*
# Storage policies for avatars and idproofs buckets

1. Public read access for both buckets (avatars are displayed publicly; idproof
   thumbnails may be viewed by admins via the public URL).
2. Authenticated users can upload/update/delete objects within their own
   user-id-prefixed folder (e.g. `avatars/<uid>.png`, `idproofs/<uid>.jpg`).
3. Provider photo uploads use path `providers/<uid>.<ext>` — allowed because the
   policy checks that the path contains the auth uid.
*/

-- avatars: public read
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

-- avatars: owner write (path contains user id)
DROP POLICY IF EXISTS "avatars_owner_write" ON storage.objects;
CREATE POLICY "avatars_owner_write"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text OR name LIKE '%' || auth.uid()::text || '%');

DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND name LIKE '%' || auth.uid()::text || '%')
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND name LIKE '%' || auth.uid()::text || '%');

-- idproofs: public read (so admin can view via URL)
DROP POLICY IF EXISTS "idproofs_public_read" ON storage.objects;
CREATE POLICY "idproofs_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'idproofs');

-- idproofs: owner write
DROP POLICY IF EXISTS "idproofs_owner_write" ON storage.objects;
CREATE POLICY "idproofs_owner_write"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'idproofs' AND name LIKE '%' || auth.uid()::text || '%');

DROP POLICY IF EXISTS "idproofs_owner_update" ON storage.objects;
CREATE POLICY "idproofs_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'idproofs' AND name LIKE '%' || auth.uid()::text || '%')
WITH CHECK (bucket_id = 'idproofs');

DROP POLICY IF EXISTS "idproofs_owner_delete" ON storage.objects;
CREATE POLICY "idproofs_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'idproofs' AND name LIKE '%' || auth.uid()::text || '%');
