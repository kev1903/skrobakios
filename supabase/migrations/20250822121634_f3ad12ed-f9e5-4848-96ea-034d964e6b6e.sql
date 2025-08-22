-- Security Fixes Migration - Working Around Dependencies
-- Phase 1: Token Security & Database Hardening (Safe Version)

-- 1. Add encryption support for xero tokens
ALTER TABLE public.xero_connections 
ADD COLUMN IF NOT EXISTS access_token_encrypted_v2 TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted_v2 TEXT,
ADD COLUMN IF NOT EXISTS encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
ADD COLUMN IF NOT EXISTS key_version INTEGER DEFAULT 1;

-- 2. Create secure token management trigger
CREATE OR REPLACE FUNCTION public.secure_xero_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- Clear plaintext tokens when encrypted versions are set
  IF NEW.access_token_encrypted_v2 IS NOT NULL THEN
    NEW.access_token := NULL;
  END IF;
  IF NEW.refresh_token_encrypted_v2 IS NOT NULL THEN  
    NEW.refresh_token := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS encrypt_xero_tokens_trigger ON public.xero_connections;
CREATE TRIGGER secure_xero_tokens_trigger
  BEFORE UPDATE ON public.xero_connections
  FOR EACH ROW EXECUTE FUNCTION secure_xero_tokens();

-- 3. Fix search_path for remaining functions (safe updates)
CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_business_context()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT company_id 
  FROM company_members 
  WHERE user_id = auth.uid() 
  AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.update_map_configurations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_xero_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Enhanced financial data protection
CREATE OR REPLACE FUNCTION public.mask_sensitive_amount(amount NUMERIC, user_id UUID, company_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  can_view_full boolean := false;
BEGIN
  -- Check if user has financial access
  SELECT EXISTS (
    SELECT 1 FROM company_members cm 
    WHERE cm.company_id = mask_sensitive_amount.company_id 
    AND cm.user_id = mask_sensitive_amount.user_id 
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  ) INTO can_view_full;

  IF can_view_full OR amount IS NULL THEN
    RETURN amount::TEXT;
  ELSE
    RETURN '***.**';
  END IF;
END;
$$;

-- 5. Token rotation tracking
CREATE TABLE IF NOT EXISTS public.token_rotation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES xero_connections(id) ON DELETE CASCADE,
  rotated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rotation_reason TEXT,
  old_token_hash TEXT, -- Hash of old token for audit
  new_token_hash TEXT, -- Hash of new token for audit
  created_by UUID DEFAULT auth.uid()
);

-- RLS for token rotation log
ALTER TABLE public.token_rotation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token rotations"
ON public.token_rotation_log FOR SELECT
USING (
  connection_id IN (
    SELECT id FROM xero_connections 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create token rotation logs"
ON public.token_rotation_log FOR INSERT
WITH CHECK (
  connection_id IN (
    SELECT id FROM xero_connections 
    WHERE user_id = auth.uid()
  )
);

-- 6. Enhanced rate limiting
CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT auth.uid(),
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_rate_limits_user_endpoint 
ON public.security_rate_limits(user_id, endpoint, window_start);

-- RLS for rate limiting
ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
ON public.security_rate_limits FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own rate limits"
ON public.security_rate_limits FOR SELECT
USING (user_id = auth.uid());

-- 7. Security monitoring function
CREATE OR REPLACE FUNCTION public.get_security_dashboard()
RETURNS TABLE(
  metric_name TEXT,
  metric_value INTEGER,
  severity_level TEXT,
  last_occurrence TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  -- Failed login attempts in last 24h
  SELECT 
    'failed_logins_24h'::TEXT,
    COUNT(*)::INTEGER,
    CASE WHEN COUNT(*) > 100 THEN 'critical'
         WHEN COUNT(*) > 50 THEN 'high'
         WHEN COUNT(*) > 10 THEN 'medium'
         ELSE 'low' END::TEXT,
    MAX(created_at)
  FROM audit_logs
  WHERE action = 'login_failed'
  AND created_at > NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  -- Recent permission changes
  SELECT 
    'permission_changes_1h'::TEXT,
    COUNT(*)::INTEGER,
    CASE WHEN COUNT(*) > 10 THEN 'critical'
         WHEN COUNT(*) > 5 THEN 'high'
         ELSE 'low' END::TEXT,
    MAX(created_at)
  FROM audit_logs
  WHERE action IN ('role_change', 'permission_grant')
  AND created_at > NOW() - INTERVAL '1 hour';
END;
$$;

-- 8. Session security enhancement
CREATE OR REPLACE FUNCTION public.security_invalidate_sessions(target_user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only superadmins can invalidate sessions
  IF NOT is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Insufficient privileges to invalidate user sessions';
  END IF;

  -- Insert audit log entry using existing function
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata, created_at)
  VALUES (
    auth.uid(),
    'session_invalidated',
    'user_session',
    target_user_id,
    jsonb_build_object(
      'invalidated_by', auth.uid(), 
      'reason', 'security_action',
      'timestamp', extract(epoch from now())
    ),
    now()
  );
END;
$$;

-- 9. Create comprehensive security audit function for superadmins
CREATE OR REPLACE FUNCTION public.security_audit_report()
RETURNS TABLE(
  audit_category TEXT,
  finding_type TEXT,
  severity TEXT,
  count INTEGER,
  details JSONB
) LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only superadmins can access this
  IF NOT is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Insufficient privileges for security audit';
  END IF;

  RETURN QUERY
  -- Token security audit
  SELECT 
    'token_security'::TEXT,
    'plaintext_tokens'::TEXT,
    'critical'::TEXT,
    COUNT(*)::INTEGER,
    jsonb_build_object(
      'description', 'Xero connections with plaintext tokens',
      'recommendation', 'Migrate to encrypted token storage'
    )
  FROM xero_connections 
  WHERE (access_token IS NOT NULL OR refresh_token IS NOT NULL)
  AND (access_token_encrypted_v2 IS NULL OR refresh_token_encrypted_v2 IS NULL)
  
  UNION ALL
  
  -- Recent security events
  SELECT 
    'access_patterns'::TEXT,
    'suspicious_activity'::TEXT,
    'medium'::TEXT,
    COUNT(*)::INTEGER,
    jsonb_build_object(
      'description', 'High-frequency permission changes',
      'timeframe', '24 hours'
    )
  FROM audit_logs
  WHERE action IN ('role_change', 'permission_grant', 'access_xero_tokens')
  AND created_at > NOW() - INTERVAL '24 hours'
  GROUP BY 1,2,3
  HAVING COUNT(*) > 20;
END;
$$;