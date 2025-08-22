-- Core Security Fixes Migration - Simplified Version
-- Focus on Critical Token Security & Function Hardening

-- 1. Add encryption fields for Xero token security
ALTER TABLE public.xero_connections 
ADD COLUMN IF NOT EXISTS access_token_encrypted_v2 TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted_v2 TEXT,
ADD COLUMN IF NOT EXISTS encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
ADD COLUMN IF NOT EXISTS key_version INTEGER DEFAULT 1;

-- 2. Create token security trigger
CREATE OR REPLACE FUNCTION public.secure_xero_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- Clear plaintext tokens when encrypted versions are set (security enhancement)
  IF NEW.access_token_encrypted_v2 IS NOT NULL AND NEW.access_token_encrypted_v2 != '' THEN
    NEW.access_token := NULL;
  END IF;
  IF NEW.refresh_token_encrypted_v2 IS NOT NULL AND NEW.refresh_token_encrypted_v2 != '' THEN  
    NEW.refresh_token := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS secure_xero_tokens_trigger ON public.xero_connections;
CREATE TRIGGER secure_xero_tokens_trigger
  BEFORE UPDATE ON public.xero_connections
  FOR EACH ROW EXECUTE FUNCTION secure_xero_tokens();

-- 3. Fix search_path for critical database functions (Phase 1 of function hardening)
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

-- 4. Create security monitoring function for superadmins
CREATE OR REPLACE FUNCTION public.get_security_overview()
RETURNS TABLE(
  security_metric TEXT,
  current_value INTEGER,
  risk_level TEXT
) LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow superadmins to access security overview
  IF NOT is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Superadmin privileges required';
  END IF;

  RETURN QUERY
  -- Check for plaintext Xero tokens (Critical Security Issue)
  SELECT 
    'plaintext_xero_tokens'::TEXT,
    COUNT(*)::INTEGER,
    CASE WHEN COUNT(*) > 0 THEN 'CRITICAL' ELSE 'OK' END::TEXT
  FROM xero_connections 
  WHERE (access_token IS NOT NULL OR refresh_token IS NOT NULL)
  
  UNION ALL
  
  -- Recent failed login attempts
  SELECT 
    'failed_logins_24h'::TEXT,
    COALESCE(COUNT(*), 0)::INTEGER,
    CASE WHEN COUNT(*) > 50 THEN 'HIGH'
         WHEN COUNT(*) > 10 THEN 'MEDIUM'
         ELSE 'LOW' END::TEXT
  FROM audit_logs
  WHERE action LIKE '%login%failed%'
  AND created_at > NOW() - INTERVAL '24 hours';
END;
$$;

-- 5. Create function to mask sensitive financial data
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  input_value TEXT,
  requesting_user_id UUID,
  context_company_id UUID
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  has_access boolean := false;
BEGIN
  -- Check if user has admin/owner access to view full data
  SELECT EXISTS (
    SELECT 1 FROM company_members 
    WHERE company_id = context_company_id 
    AND user_id = requesting_user_id 
    AND role IN ('owner', 'admin')
    AND status = 'active'
  ) INTO has_access;

  -- Return full value if user has access, otherwise mask it
  IF has_access OR input_value IS NULL THEN
    RETURN input_value;
  ELSE
    -- Basic masking - show first 2 and last 2 characters
    IF LENGTH(input_value) <= 4 THEN
      RETURN '***';
    ELSE
      RETURN LEFT(input_value, 2) || REPEAT('*', LENGTH(input_value) - 4) || RIGHT(input_value, 2);
    END IF;
  END IF;
END;
$$;