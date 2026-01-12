-- Add onboarding_complete column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- Add style_preferences column to store pain points and other preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS style_preferences jsonb DEFAULT '{}'::jsonb;