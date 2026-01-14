-- Add policy to allow authenticated users to upload temporary images for try-on preprocessing
CREATE POLICY "Users can upload temp try-on images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'temp' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Add policy to allow users to read their own temp images
CREATE POLICY "Users can read their own temp images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'temp' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Add policy to allow users to delete their own temp images (cleanup)
CREATE POLICY "Users can delete their own temp images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'temp' AND
  (storage.foldername(name))[2] = auth.uid()::text
);