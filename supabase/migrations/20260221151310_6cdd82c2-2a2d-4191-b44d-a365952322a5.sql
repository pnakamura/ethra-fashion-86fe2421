-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.tester_notifications;

-- Create a restrictive policy: only admins can insert
CREATE POLICY "Admins can insert tester notifications"
ON public.tester_notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));