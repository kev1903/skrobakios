-- Security Fix Phase 1: Critical Data Protection and Database Hardening

-- 1. Restrict public access to companies table - require authentication
DROP POLICY IF EXISTS "Public companies are viewable by authenticated users" ON public.companies;

CREATE POLICY "Authenticated users can view verified public companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  -- Company members can see their companies
  is_company_member_secure(id, auth.uid()) 
  OR 
  -- Platform admins can see all companies
  is_platform_admin() 
  OR 
  -- Authenticated users can only see verified public companies (not all public companies)
  (public_page = true AND verified = true)
);

-- 2. Add authentication requirement to reviews table (if it exists and is public)
-- First check if there are any overly permissive policies on reviews
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;

-- 3. Fix database functions missing SET search_path for security
-- Update critical functions to prevent search_path attacks

ALTER FUNCTION public.update_tasks_updated_at() SET search_path = '';
ALTER FUNCTION public.get_project_scope(uuid) SET search_path = '';
ALTER FUNCTION public.update_rating_stats() SET search_path = '';
ALTER FUNCTION public.update_voice_sessions_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.set_issue_number() SET search_path = '';
ALTER FUNCTION public.set_defect_number() SET search_path = '';
ALTER FUNCTION public.enhanced_audit_log() SET search_path = '';
ALTER FUNCTION public.calculate_invoice_total() SET search_path = '';
ALTER FUNCTION public.calculate_bill_total() SET search_path = '';
ALTER FUNCTION public.calculate_item_amount() SET search_path = '';
ALTER FUNCTION public.log_stakeholder_contact_access() SET search_path = '';
ALTER FUNCTION public.get_masked_lead_data(uuid) SET search_path = '';
ALTER FUNCTION public.generate_contract_number() SET search_path = '';
ALTER FUNCTION public.set_contract_number() SET search_path = '';
ALTER FUNCTION public.set_task_company_id() SET search_path = '';
ALTER FUNCTION public.update_stakeholders_updated_at() SET search_path = '';
ALTER FUNCTION public.update_stakeholder_compliance_status() SET search_path = '';
ALTER FUNCTION public.generate_rfq_number() SET search_path = '';
ALTER FUNCTION public.generate_commitment_number() SET search_path = '';
ALTER FUNCTION public.set_rfq_number() SET search_path = '';
ALTER FUNCTION public.set_commitment_number() SET search_path = '';
ALTER FUNCTION public.update_procurement_updated_at() SET search_path = '';
ALTER FUNCTION public.ensure_unique_profile_slug() SET search_path = '';

-- 4. Create secure birth_date access function to prevent exposure
CREATE OR REPLACE FUNCTION public.get_user_birth_date_secure(target_user_id uuid)
RETURNS date
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result date;
BEGIN
  -- Only allow users to see their own birth date or superadmins
  IF auth.uid() = target_user_id OR public.is_superadmin(auth.uid()) THEN
    SELECT birth_date INTO result 
    FROM public.profiles 
    WHERE user_id = target_user_id;
    RETURN result;
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- Grant execute permission only to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_birth_date_secure(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_user_birth_date_secure(uuid) IS 
'Securely returns birth_date only to the user themselves or superadmins. Never exposes birth dates publicly.';

-- 5. Create enhanced rate limiting table for database-backed persistence
CREATE TABLE IF NOT EXISTS public.security_rate_limits_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(identifier, action_type)
);

-- Add RLS to rate limits table
ALTER TABLE public.security_rate_limits_enhanced ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage rate limits"
ON public.security_rate_limits_enhanced
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- 6. Create security event monitoring table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info', -- info, warn, error, critical
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS to security events table
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert security events"
ON public.security_events
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Superadmins can view security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

-- 7. Add updated_at trigger to rate limits table
CREATE TRIGGER update_security_rate_limits_enhanced_updated_at
BEFORE UPDATE ON public.security_rate_limits_enhanced
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.security_rate_limits_enhanced IS 
'Enhanced rate limiting with database persistence and progressive penalties';

COMMENT ON TABLE public.security_events IS 
'Security event monitoring and audit trail for suspicious activities';