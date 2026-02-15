-- Add terms and privacy version tracking for LGPD compliance
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS privacy_version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS biometric_consent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;