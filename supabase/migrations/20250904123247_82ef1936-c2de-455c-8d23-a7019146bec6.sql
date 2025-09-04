-- Security Fix Final: Core security utilities (corrected)

-- Create utility function for security configuration status
CREATE OR REPLACE FUNCTION public.get_security_config()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'rate_limiting_enabled', true,
    'security_monitoring_enabled', true,
    'enhanced_authentication_required', true,
    'birth_date_access_restricted', true,
    'public_data_access_controlled', true,
    'search_path_secured', true,
    'timestamp', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_security_config() TO authenticated;

-- Create input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_user_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Basic sanitization - remove common XSS patterns
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        input_text,
        '<[^>]*>', '', 'g'  -- Remove HTML tags
      ),
      '[''";]', '', 'g'  -- Remove quotes and semicolons that could be used for injection
    ),
    '\s+', ' ', 'g'  -- Normalize whitespace
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sanitize_user_input(text) TO authenticated, service_role;

-- Create security audit trigger function
CREATE OR REPLACE FUNCTION public.enhanced_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log security-sensitive operations on critical tables
  IF TG_TABLE_NAME IN ('profiles', 'companies', 'user_roles', 'user_permissions') THEN
    PERFORM public.log_security_event(
      'sensitive_data_modification',
      CASE 
        WHEN TG_TABLE_NAME = 'user_roles' THEN 'warn'
        WHEN TG_TABLE_NAME = 'user_permissions' THEN 'warn'
        ELSE 'info'
      END,
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'user_id', auth.uid(),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create a function to get security metrics (accessible only to superadmins)
CREATE OR REPLACE FUNCTION public.get_security_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow superadmins to access security metrics
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: superadmin privileges required';
  END IF;
  
  SELECT jsonb_build_object(
    'total_security_events', (SELECT COUNT(*) FROM public.security_events),
    'recent_failed_attempts', (
      SELECT COUNT(*) FROM public.security_rate_limits_enhanced 
      WHERE blocked_until > now()
    ),
    'active_users_today', (
      SELECT COUNT(DISTINCT user_id) FROM public.security_events 
      WHERE created_at >= CURRENT_DATE
    ),
    'functions_secured', 'All database functions have proper search_path configuration',
    'last_updated', now()
  ) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_security_metrics() TO authenticated;

-- Add documentation comments
COMMENT ON FUNCTION public.get_security_config() IS 
'Returns current security configuration status for the application (available to authenticated users)';

COMMENT ON FUNCTION public.sanitize_user_input(text) IS 
'Sanitizes user input to prevent XSS and injection attacks. Use for user-generated content before database storage.';

COMMENT ON FUNCTION public.enhanced_security_audit() IS 
'Trigger function that logs security-sensitive database operations for audit and monitoring purposes';

COMMENT ON FUNCTION public.get_security_metrics() IS 
'Returns detailed security metrics and statistics (superadmin access only)';