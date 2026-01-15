-- Adicionar política para permitir uploads na pasta temp do bucket avatars
CREATE POLICY "Users can upload to temp folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'temp'
);

-- Política para permitir leitura de arquivos temp
CREATE POLICY "Users can read temp folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'temp'
);