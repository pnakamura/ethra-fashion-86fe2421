
-- =============================================
-- Table: admin_audit_log
-- Registers all administrative actions
-- =============================================
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit log"
  ON public.admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audit_log_admin ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_audit_log_target ON public.admin_audit_log(target_user_id);
CREATE INDEX idx_audit_log_created ON public.admin_audit_log(created_at DESC);

-- =============================================
-- Table: data_requests (LGPD)
-- User data rights requests
-- =============================================
CREATE TABLE public.data_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('access', 'portability', 'deletion', 'correction', 'revocation')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  notes text,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data requests"
  ON public.data_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data requests"
  ON public.data_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all data requests"
  ON public.data_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update data requests"
  ON public.data_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_data_requests_user ON public.data_requests(user_id);
CREATE INDEX idx_data_requests_status ON public.data_requests(status);

-- =============================================
-- Admin RLS for subscription_plans (CRUD)
-- =============================================
CREATE POLICY "Admins can insert plans"
  ON public.subscription_plans FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plans"
  ON public.subscription_plans FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plans"
  ON public.subscription_plans FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Admin RLS for plan_limits (CRUD)
-- =============================================
CREATE POLICY "Admins can insert plan limits"
  ON public.plan_limits FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plan limits"
  ON public.plan_limits FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plan limits"
  ON public.plan_limits FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Admin SELECT on biometric_consent_logs
-- =============================================
CREATE POLICY "Admins can view all consent logs"
  ON public.biometric_consent_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
