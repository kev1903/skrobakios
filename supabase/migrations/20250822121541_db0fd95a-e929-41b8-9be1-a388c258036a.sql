-- Critical Security Fixes Migration (Fixed)
-- Phase 1: Token Security & Database Hardening

-- 1. Add encryption support for xero tokens
ALTER TABLE public.xero_connections 
ADD COLUMN IF NOT EXISTS access_token_encrypted_v2 TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted_v2 TEXT,
ADD COLUMN IF NOT EXISTS encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
ADD COLUMN IF NOT EXISTS key_version INTEGER DEFAULT 1;

-- 2. Create secure token management functions
CREATE OR REPLACE FUNCTION public.encrypt_xero_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be implemented with proper encryption in the application layer
  -- For now, we ensure the old plaintext fields are cleared when new encrypted ones are set
  IF NEW.access_token_encrypted_v2 IS NOT NULL THEN
    NEW.access_token := NULL;
  END IF;
  IF NEW.refresh_token_encrypted_v2 IS NOT NULL THEN  
    NEW.refresh_token := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER encrypt_xero_tokens_trigger
  BEFORE UPDATE ON public.xero_connections
  FOR EACH ROW EXECUTE FUNCTION encrypt_xero_tokens();

-- 3. Fix search_path for critical functions
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

-- 4. Drop and recreate log_user_action with proper signature
DROP FUNCTION IF EXISTS public.log_user_action(text, text, uuid, jsonb);

CREATE OR REPLACE FUNCTION public.log_user_action(
  _action TEXT,
  _resource_type TEXT,
  _resource_id UUID,
  _metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    _action,
    _resource_type,
    _resource_id,
    _metadata || jsonb_build_object(
      'timestamp', extract(epoch from now()),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent',
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 5. Enhanced financial data protection
CREATE OR REPLACE FUNCTION public.mask_financial_amount(amount NUMERIC, user_id UUID, company_id UUID)
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
    WHERE cm.company_id = mask_financial_amount.company_id 
    AND cm.user_id = mask_financial_amount.user_id 
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

-- 6. Token rotation tracking
CREATE TABLE IF NOT EXISTS public.token_rotation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES xero_connections(id),
  rotated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rotation_reason TEXT,
  old_token_hash TEXT,
  new_token_hash TEXT
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

-- 7. Rate limiting enhancements
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_user_endpoint_window 
ON public.rate_limit_log(user_id, endpoint, window_start);

-- RLS for rate limiting
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
ON public.rate_limit_log FOR ALL
USING (auth.role() = 'service_role');

-- 8. Session security function
CREATE OR REPLACE FUNCTION public.invalidate_user_sessions(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Log the session invalidation
  PERFORM log_user_action(
    'session_invalidated',
    'user_session', 
    target_user_id,
    jsonb_build_object('invalidated_by', auth.uid(), 'reason', 'security_update')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 9. Security monitoring function for admins
CREATE OR REPLACE FUNCTION public.get_security_summary()
RETURNS TABLE(
  metric_name TEXT,
  metric_value INTEGER,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Failed login attempts in last 24h
  SELECT 
    'failed_logins_24h'::TEXT,
    COUNT(*)::INTEGER,
    CASE WHEN COUNT(*) > 100 THEN 'critical'
         WHEN COUNT(*) > 50 THEN 'high'
         WHEN COUNT(*) > 10 THEN 'medium'
         ELSE 'low' END::TEXT
  FROM audit_logs
  WHERE action = 'login_failed'
  AND created_at > NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  -- Permission changes in last hour
  SELECT 
    'permission_changes_1h'::TEXT,
    COUNT(*)::INTEGER,
    CASE WHEN COUNT(*) > 10 THEN 'critical'
         WHEN COUNT(*) > 5 THEN 'high'
         ELSE 'low' END::TEXT
  FROM audit_logs
  WHERE action IN ('role_change', 'permission_grant')
  AND created_at > NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';