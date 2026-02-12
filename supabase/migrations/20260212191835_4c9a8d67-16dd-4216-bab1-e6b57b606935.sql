
ALTER TABLE profiles
  ALTER COLUMN subscription_plan_id SET DEFAULT 'muse';

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, subscription_plan_id, subscription_expires_at)
  VALUES (NEW.id, 'muse', now() + interval '1 year');
  RETURN NEW;
END;
$$;
