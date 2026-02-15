-- =============================================================
-- Data Retention Policies
-- Adds last_used_at tracking for avatars and schedules
-- automated cleanup via pg_cron + pg_net.
-- =============================================================

-- 1. Add last_used_at to user_avatars for 12-month retention tracking
ALTER TABLE public.user_avatars
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT now();

-- Back-fill: set last_used_at = created_at for existing rows
UPDATE public.user_avatars SET last_used_at = created_at WHERE last_used_at IS NULL;

-- 2. Auto-update last_used_at when an avatar is used in a try-on
CREATE OR REPLACE FUNCTION public.touch_avatar_last_used()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.avatar_id IS NOT NULL THEN
    UPDATE public.user_avatars
       SET last_used_at = now()
     WHERE id = NEW.avatar_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_touch_avatar_on_tryon ON public.try_on_results;
CREATE TRIGGER trg_touch_avatar_on_tryon
  AFTER INSERT ON public.try_on_results
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_avatar_last_used();

-- 3. Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 4. Schedule daily data-retention cleanup at 03:00 UTC
--    Calls the cleanup-retention-data Edge Function via pg_net.
SELECT cron.schedule(
  'daily-retention-cleanup',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url   := current_setting('app.settings.supabase_url') || '/functions/v1/cleanup-retention-data',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type',  'application/json'
    ),
    body  := '{}'::jsonb
  );
  $$
);
