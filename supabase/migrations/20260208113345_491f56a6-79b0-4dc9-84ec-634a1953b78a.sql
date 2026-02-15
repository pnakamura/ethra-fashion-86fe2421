-- Add trip_analysis column to store complete weather and AI analysis data
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS trip_analysis jsonb DEFAULT NULL;

-- Add comment explaining the column structure
COMMENT ON COLUMN public.trips.trip_analysis IS 'Stores complete trip analysis including weather, trip_brief, tips, and suggested_looks';