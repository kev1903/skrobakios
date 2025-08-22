-- Critical Security Fixes Migration
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

-- 3. Fix search_path for all existing functions that need it
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

CREATE OR REPLACE FUNCTION public.user_can_access_project_direct(project_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_id_param 
    AND cm.user_id = user_id_param 
    AND cm.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(target_user_id uuid)
RETURNS app_role[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  roles_array app_role[];
BEGIN
  SELECT ARRAY_AGG(role ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'business_admin' THEN 2
      WHEN 'project_admin' THEN 3
      WHEN 'user' THEN 4
      WHEN 'client' THEN 5
    END
  ) INTO roles_array
  FROM user_roles 
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(roles_array, ARRAY['user'::app_role]);
END;
$function$;

-- 4. Create comprehensive audit logging function
CREATE OR REPLACE FUNCTION public.log_user_action(
  action_name TEXT,
  resource_type TEXT,
  resource_id UUID,
  metadata_data JSONB DEFAULT '{}'::jsonb
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
    action_name,
    resource_type,
    resource_id,
    metadata_data || jsonb_build_object(
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

-- 6. Create security monitoring view
CREATE OR REPLACE VIEW public.security_alerts AS
SELECT 
  'failed_login'::TEXT as alert_type,
  COUNT(*) as count,
  DATE_TRUNC('hour', created_at) as time_window
FROM audit_logs 
WHERE action = 'login_failed' 
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
HAVING COUNT(*) > 10

UNION ALL

SELECT 
  'suspicious_permissions'::TEXT as alert_type,
  COUNT(*) as count,
  DATE_TRUNC('hour', created_at) as time_window  
FROM audit_logs
WHERE action IN ('role_change', 'permission_grant')
AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY DATE_TRUNC('hour', created_at)
HAVING COUNT(*) > 5;

-- 7. Token rotation tracking
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

-- 8. Rate limiting enhancements
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

-- 9. Session security function
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
  
  -- This would typically integrate with your session management
  -- For now, we just log the event
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';