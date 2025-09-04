-- Security Fix Phase 2: Complete remaining function security hardening

-- Fix remaining functions that still need SET search_path for security
ALTER FUNCTION public.can_manage_company(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.is_company_admin_or_owner(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.is_company_member(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.update_daily_priorities_notes_updated_at() SET search_path = '';
ALTER FUNCTION public.update_system_configurations_updated_at() SET search_path = '';
ALTER FUNCTION public.set_user_primary_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.handle_new_user_role() SET search_path = '';
ALTER FUNCTION public.calculate_quote_totals() SET search_path = '';
ALTER FUNCTION public.calculate_commitment_totals() SET search_path = '';
ALTER FUNCTION public.update_platform_settings_updated_at() SET search_path = '';
ALTER FUNCTION public.can_access_stakeholder_contacts(uuid) SET search_path = '';
ALTER FUNCTION public.can_manage_stakeholder_contacts(uuid) SET search_path = '';
ALTER FUNCTION public.can_view_company_projects(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_calendar_tokens(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_subscription(uuid) SET search_path = '';
ALTER FUNCTION public.update_calendar_tokens(uuid, text, text, timestamp with time zone) SET search_path = '';
ALTER FUNCTION public.has_role_secure(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.log_calendar_integration_access() SET search_path = '';
ALTER FUNCTION public.can_manage_company_projects(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.is_project_member_secure(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_user_highest_role_level(uuid) SET search_path = '';
ALTER FUNCTION public.is_project_admin_secure(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.can_manage_project_secure(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_user_current_company_id() SET search_path = '';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.is_company_owner(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.is_superadmin(uuid) SET search_path = '';
ALTER FUNCTION public.get_safe_profile_data(uuid) SET search_path = '';
ALTER FUNCTION public.get_masked_lead_contact(text, text, uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_manageable_users_for_user(uuid) SET search_path = '';
ALTER FUNCTION public.is_project_member(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.switch_user_company(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.user_has_permission(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.set_user_permissions(uuid, uuid, jsonb) SET search_path = '';
ALTER FUNCTION public.validate_json_fields() SET search_path = '';
ALTER FUNCTION public.get_user_subscription() SET search_path = '';
ALTER FUNCTION public.get_stakeholder_contacts_secure(uuid, boolean) SET search_path = '';
ALTER FUNCTION public.update_invoice_payment_status() SET search_path = '';
ALTER FUNCTION public.update_bill_payment_status() SET search_path = '';
ALTER FUNCTION public.enhanced_contact_audit_log() SET search_path = '';
ALTER FUNCTION public.get_public_profile_safe(uuid) SET search_path = '';
ALTER FUNCTION public.migrate_linked_tasks_to_predecessors() SET search_path = '';

-- Create a security utility function for enhanced rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier_param text,
  action_type_param text,
  max_attempts_param integer DEFAULT 5,
  window_minutes_param integer DEFAULT 15,
  block_minutes_param integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  rate_limit_record RECORD;
  current_time timestamp with time zone := now();
  window_start timestamp with time zone := current_time - (window_minutes_param * interval '1 minute');
  result jsonb;
BEGIN
  -- Get or create rate limit record
  INSERT INTO public.security_rate_limits_enhanced 
    (identifier, action_type, attempt_count, window_start)
  VALUES 
    (identifier_param, action_type_param, 1, current_time)
  ON CONFLICT (identifier, action_type) 
  DO UPDATE SET
    attempt_count = CASE 
      WHEN security_rate_limits_enhanced.window_start < window_start THEN 1
      ELSE security_rate_limits_enhanced.attempt_count + 1
    END,
    window_start = CASE
      WHEN security_rate_limits_enhanced.window_start < window_start THEN current_time
      ELSE security_rate_limits_enhanced.window_start
    END,
    blocked_until = CASE
      WHEN security_rate_limits_enhanced.attempt_count + 1 >= max_attempts_param THEN 
        current_time + (block_minutes_param * interval '1 minute')
      ELSE security_rate_limits_enhanced.blocked_until
    END,
    updated_at = current_time
  RETURNING * INTO rate_limit_record;

  -- Check if currently blocked
  IF rate_limit_record.blocked_until IS NOT NULL AND rate_limit_record.blocked_until > current_time THEN
    result := jsonb_build_object(
      'allowed', false,
      'blocked_until', rate_limit_record.blocked_until,
      'reason', 'rate_limited'
    );
  ELSIF rate_limit_record.attempt_count >= max_attempts_param THEN
    result := jsonb_build_object(
      'allowed', false,
      'blocked_until', rate_limit_record.blocked_until,
      'reason', 'max_attempts_exceeded'
    );
  ELSE
    result := jsonb_build_object(
      'allowed', true,
      'attempts_remaining', max_attempts_param - rate_limit_record.attempt_count
    );
  END IF;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated and service roles
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer, integer) TO authenticated, service_role;

COMMENT ON FUNCTION public.check_rate_limit(text, text, integer, integer, integer) IS 
'Enhanced rate limiting with progressive penalties and database persistence. Returns allowed status and remaining attempts.';

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type_param text,
  severity_param text DEFAULT 'info',
  metadata_param jsonb DEFAULT '{}',
  user_id_param uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    metadata,
    ip_address,
    created_at
  ) VALUES (
    user_id_param,
    event_type_param,
    severity_param,
    metadata_param,
    (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet,
    now()
  ) RETURNING id INTO event_id;

  RETURN event_id;
END;
$$;

-- Grant execute permission to authenticated and service roles
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, jsonb, uuid) TO authenticated, service_role;

COMMENT ON FUNCTION public.log_security_event(text, text, jsonb, uuid) IS 
'Logs security events for monitoring and audit purposes. Automatically captures IP address from request headers.';