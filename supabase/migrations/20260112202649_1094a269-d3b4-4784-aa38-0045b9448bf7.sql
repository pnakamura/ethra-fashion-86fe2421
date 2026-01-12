-- Add columns for garment color analysis
ALTER TABLE public.wardrobe_items 
ADD COLUMN IF NOT EXISTS dominant_colors JSONB,
ADD COLUMN IF NOT EXISTS chromatic_compatibility TEXT DEFAULT 'unknown';

-- Add comment for documentation
COMMENT ON COLUMN public.wardrobe_items.dominant_colors IS 'AI-analyzed dominant colors: [{hex, name, percentage}]';
COMMENT ON COLUMN public.wardrobe_items.chromatic_compatibility IS 'Compatibility with user chromatic palette: ideal, neutral, avoid, unknown';

-- Create index for efficient filtering by compatibility
CREATE INDEX IF NOT EXISTS idx_wardrobe_chromatic 
ON public.wardrobe_items(user_id, chromatic_compatibility);

-- Create table for caching recommended looks
CREATE TABLE IF NOT EXISTS public.recommended_looks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  occasion TEXT,
  look_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours')
);

-- Enable RLS for recommended_looks
ALTER TABLE public.recommended_looks ENABLE ROW LEVEL SECURITY;

-- RLS policies for recommended_looks
CREATE POLICY "Users can view their own recommended looks"
  ON public.recommended_looks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommended looks"
  ON public.recommended_looks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommended looks"
  ON public.recommended_looks FOR DELETE 
  USING (auth.uid() = user_id);