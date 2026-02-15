
CREATE TABLE public.biometric_consent_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  consent_type text NOT NULL,
  consent_granted boolean NOT NULL DEFAULT false,
  term_version text NOT NULL DEFAULT '1.0.0',
  context text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.biometric_consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent logs"
  ON public.biometric_consent_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent logs"
  ON public.biometric_consent_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_biometric_consent_logs_user_id ON public.biometric_consent_logs (user_id);
