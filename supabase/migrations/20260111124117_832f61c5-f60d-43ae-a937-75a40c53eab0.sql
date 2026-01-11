-- Create storage buckets for virtual try-on
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('try-on-results', 'try-on-results', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('external-garments', 'external-garments', true);

-- RLS policies for avatars bucket
CREATE POLICY "Users can view their own avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for try-on-results bucket
CREATE POLICY "Users can view their own try-on results"
ON storage.objects FOR SELECT
USING (bucket_id = 'try-on-results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own try-on results"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'try-on-results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own try-on results"
ON storage.objects FOR DELETE
USING (bucket_id = 'try-on-results' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for external-garments bucket
CREATE POLICY "Users can view their own external garments"
ON storage.objects FOR SELECT
USING (bucket_id = 'external-garments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own external garments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'external-garments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own external garments"
ON storage.objects FOR DELETE
USING (bucket_id = 'external-garments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Table for user avatars (full body photos)
CREATE TABLE public.user_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  body_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_avatars
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own avatars"
ON public.user_avatars FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own avatars"
ON public.user_avatars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatars"
ON public.user_avatars FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avatars"
ON public.user_avatars FOR DELETE
USING (auth.uid() = user_id);

-- Table for try-on results
CREATE TABLE public.try_on_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  avatar_id UUID REFERENCES public.user_avatars(id) ON DELETE SET NULL,
  garment_source TEXT NOT NULL, -- 'wardrobe', 'external_photo', 'screenshot'
  garment_id UUID, -- Reference to wardrobe_items if from wardrobe
  garment_image_url TEXT NOT NULL,
  result_image_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on try_on_results
ALTER TABLE public.try_on_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own try-on results"
ON public.try_on_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own try-on results"
ON public.try_on_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own try-on results"
ON public.try_on_results FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own try-on results"
ON public.try_on_results FOR DELETE
USING (auth.uid() = user_id);

-- Table for external garments (captured from photos/screenshots)
CREATE TABLE public.external_garments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- 'camera_scan', 'screenshot', 'url'
  original_image_url TEXT NOT NULL,
  processed_image_url TEXT,
  detected_category TEXT,
  source_url TEXT,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on external_garments
ALTER TABLE public.external_garments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own external garments"
ON public.external_garments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own external garments"
ON public.external_garments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own external garments"
ON public.external_garments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own external garments"
ON public.external_garments FOR DELETE
USING (auth.uid() = user_id);

-- Function to ensure only one primary avatar per user
CREATE OR REPLACE FUNCTION public.ensure_single_primary_avatar()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.user_avatars
    SET is_primary = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ensure_single_primary_avatar_trigger
AFTER INSERT OR UPDATE ON public.user_avatars
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_primary_avatar();