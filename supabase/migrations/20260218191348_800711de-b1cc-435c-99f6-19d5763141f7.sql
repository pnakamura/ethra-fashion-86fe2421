
-- Add tester tracking columns to profiles
ALTER TABLE public.profiles ADD COLUMN is_tester boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN tester_registered_at timestamptz;

-- Create tester_notifications table for logging admin notifications
CREATE TABLE public.tester_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  username text,
  notified_at timestamptz NOT NULL DEFAULT now(),
  notification_status text NOT NULL DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.tester_notifications ENABLE ROW LEVEL SECURITY;

-- Only service role / admins can access this table
CREATE POLICY "Admins can view tester notifications"
ON public.tester_notifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert notifications"
ON public.tester_notifications
FOR INSERT
WITH CHECK (true);
