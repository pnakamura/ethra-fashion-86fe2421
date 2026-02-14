
-- Create feature flags table
CREATE TABLE public.app_feature_flags (
  id text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz DEFAULT now(),
  description text
);

ALTER TABLE public.app_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read flags" ON public.app_feature_flags FOR SELECT USING (true);
CREATE POLICY "Admin can update flags" ON public.app_feature_flags FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can insert flags" ON public.app_feature_flags FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_feature_flags (id, enabled, description) VALUES
  ('liveness_detection', false, 'Exigir prova de vida na câmera cromática'),
  ('face_matching', false, 'Comparar rosto do avatar com selfie de referência');

-- Add face embedding hash to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS face_embedding_hash jsonb;
