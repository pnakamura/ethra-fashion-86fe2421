
-- Create wardrobe-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe-images', 'wardrobe-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload their own wardrobe images
CREATE POLICY "Users can upload wardrobe images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wardrobe-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Anyone can view wardrobe images (public bucket)
CREATE POLICY "Public read access for wardrobe images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wardrobe-images');

-- RLS: Users can delete their own wardrobe images
CREATE POLICY "Users can delete own wardrobe images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'wardrobe-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can update their own wardrobe images
CREATE POLICY "Users can update own wardrobe images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'wardrobe-images' AND (storage.foldername(name))[1] = auth.uid()::text);
