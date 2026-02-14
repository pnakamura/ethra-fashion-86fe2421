
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz;
