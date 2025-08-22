-- CRITICAL SECURITY FIXES

-- 1. Add encryption for authentication tokens in xero_connections
ALTER TABLE public.xero_connections 
ADD COLUMN access_token_encrypted text,
ADD COLUMN refresh_token_encrypted text,
ADD COLUMN encryption_key_id text DEFAULT 'default';

-- Create function to encrypt/decrypt tokens (using pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Use symmetric encryption with a key derived from environment
  RETURN encode(
    encrypt(
      data::bytea, 
      digest(COALESCE(current_setting('app.encryption_key', true), 'default_key'), 'sha256'), 
      'aes'
    ), 
    'base64'
  );
END;
$$;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF encrypted_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN convert_from(
    decrypt(
      decode(encrypted_data, 'base64'),
      digest(COALESCE(current_setting('app.encryption_key', true), 'default_key'), 'sha256'), 
      'aes'
    ), 
    'utf8'
  );
END;
$$;

-- 2. Enhance xero_connections RLS policies with additional security
DROP POLICY IF EXISTS "Users can view their own Xero connection" ON public.xero_connections;
CREATE POLICY "Users can view their own Xero connection with audit"
ON public.xero_connections 
FOR SELECT 
USING (
  auth.uid() = user_id AND
  -- Log access to sensitive Xero tokens
  (SELECT public.log_user_action(
    'access_xero_tokens',
    'xero_connection', 
    id,
    jsonb_build_object(
      'tenant_id', tenant_id,
      'has_tokens', (access_token IS NOT NULL OR access_token_encrypted IS NOT NULL)
    )
  ) IS NULL OR TRUE)
);

-- 3. Add encryption for user_access_tokens
ALTER TABLE public.user_access_tokens 
ADD COLUMN token_encrypted text,
ADD COLUMN encryption_key_id text DEFAULT 'default';

-- Enhanced RLS for user_access_tokens with audit logging
CREATE POLICY "Log access token usage for security monitoring"
ON public.user_access_tokens 
FOR SELECT 
USING (
  -- Log when access tokens are retrieved
  (SELECT public.log_user_action(
    'access_user_token',
    'user_access_token',
    id,
    jsonb_build_object(
      'token_type', token_type,
      'user_id', user_id,
      'expires_at', expires_at
    )
  ) IS NULL OR TRUE)
);

-- 4. Fix database functions search_path (addressing SQL injection vulnerability)
-- Update all security definer functions to have proper search_path

-- Fix existing functions that are missing search_path
CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
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

-- 5. Add comprehensive audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.enhanced_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Enhanced logging for sensitive table operations
  IF TG_TABLE_NAME IN ('user_roles', 'company_members', 'project_members', 'user_permissions') THEN
    INSERT INTO public.audit_logs (
      user_id, action, resource_type, resource_id, 
      metadata, created_at
    ) VALUES (
      auth.uid(), TG_OP, TG_TABLE_NAME, 
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'old_data', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      now()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

DROP TRIGGER IF EXISTS audit_company_members ON public.company_members;  
CREATE TRIGGER audit_company_members
  AFTER INSERT OR UPDATE OR DELETE ON public.company_members
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

DROP TRIGGER IF EXISTS audit_user_permissions ON public.user_permissions;
CREATE TRIGGER audit_user_permissions
  AFTER INSERT OR UPDATE OR DELETE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_log();

-- 6. Add rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- user_id, ip, etc
  action_type text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, action_type, window_start)
);

-- RLS for rate limits table
ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can view rate limits"
ON public.security_rate_limits
FOR SELECT
USING (public.is_superadmin(auth.uid()));

-- Function to check and enforce rate limits
CREATE OR REPLACE FUNCTION public.check_security_rate_limit(
  identifier_param text,
  action_type_param text,
  max_attempts integer DEFAULT 10,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_window timestamp with time zone;
  attempt_count integer;
BEGIN
  -- Calculate current window (rounded down to window_minutes)
  current_window := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / window_minutes) * (window_minutes || ' minutes')::interval;
  
  -- Get current attempt count for this window
  SELECT COALESCE(security_rate_limits.attempt_count, 0) INTO attempt_count
  FROM public.security_rate_limits
  WHERE identifier = identifier_param 
    AND action_type = action_type_param
    AND window_start = current_window;
  
  -- Check if limit exceeded
  IF attempt_count >= max_attempts THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  INSERT INTO public.security_rate_limits (identifier, action_type, window_start, attempt_count)
  VALUES (identifier_param, action_type_param, current_window, 1)
  ON CONFLICT (identifier, action_type, window_start)
  DO UPDATE SET attempt_count = security_rate_limits.attempt_count + 1;
  
  RETURN true;
END;
$function$;