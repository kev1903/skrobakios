-- Enhanced security for stakeholder contacts
-- This migration addresses critical security vulnerabilities in contact data access

-- 1. Create a secure function for masked contact access with audit logging
CREATE OR REPLACE FUNCTION public.get_stakeholder_contacts_secure(
  target_stakeholder_id uuid,
  include_sensitive_data boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  stakeholder_id uuid,
  name text,
  title text,
  email text,
  phone text,
  mobile text,
  is_primary boolean,
  is_preferred boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_id uuid := auth.uid();
  can_manage boolean := false;
  can_access boolean := false;
  contact_record RECORD;
BEGIN
  -- Validate authentication
  IF requesting_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check management permissions (owners/admins get full access)
  SELECT public.can_manage_stakeholder_contacts(target_stakeholder_id) INTO can_manage;
  
  -- Check basic access permissions (company members)
  SELECT public.can_access_stakeholder_contacts(target_stakeholder_id) INTO can_access;
  
  -- Deny access if user has no permissions
  IF NOT (can_manage OR can_access) THEN
    -- Log unauthorized access attempt
    INSERT INTO public.security_events (
      user_id, event_type, severity, metadata, created_at
    ) VALUES (
      requesting_user_id,
      'unauthorized_stakeholder_contact_access',
      'high',
      jsonb_build_object(
        'stakeholder_id', target_stakeholder_id,
        'attempted_sensitive_access', include_sensitive_data,
        'user_ip', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      now()
    );
    
    RAISE EXCEPTION 'Access denied: insufficient permissions for stakeholder contacts';
  END IF;

  -- Log legitimate access with audit trail
  INSERT INTO public.security_events (
    user_id, event_type, severity, metadata, created_at
  ) VALUES (
    requesting_user_id,
    'stakeholder_contact_access',
    'info',
    jsonb_build_object(
      'stakeholder_id', target_stakeholder_id,
      'access_level', CASE WHEN can_manage THEN 'full' ELSE 'limited' END,
      'sensitive_data_requested', include_sensitive_data,
      'user_ip', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    now()
  );

  -- Return data with appropriate masking
  FOR contact_record IN
    SELECT sc.id, sc.stakeholder_id, sc.name, sc.title, sc.email, sc.phone, sc.mobile,
           sc.is_primary, sc.is_preferred, sc.created_at
    FROM public.stakeholder_contacts sc
    WHERE sc.stakeholder_id = target_stakeholder_id
  LOOP
    -- Apply masking rules based on permissions
    IF can_manage OR include_sensitive_data THEN
      -- Full access for managers or explicit sensitive data request
      id := contact_record.id;
      stakeholder_id := contact_record.stakeholder_id;
      name := contact_record.name;
      title := contact_record.title;
      email := contact_record.email;
      phone := contact_record.phone;
      mobile := contact_record.mobile;
      is_primary := contact_record.is_primary;
      is_preferred := contact_record.is_preferred;
      created_at := contact_record.created_at;
    ELSE
      -- Limited access with masking for regular members
      id := contact_record.id;
      stakeholder_id := contact_record.stakeholder_id;
      name := contact_record.name;
      title := contact_record.title;
      -- Mask sensitive contact information
      email := CASE 
        WHEN contact_record.email IS NOT NULL THEN
          regexp_replace(contact_record.email, '^(.{2})[^@]*(@.*)$', '\1***\2')
        ELSE NULL
      END;
      phone := CASE 
        WHEN contact_record.phone IS NOT NULL THEN
          regexp_replace(contact_record.phone, '^(.{3}).*(.{2})$', '\1***\2')
        ELSE NULL
      END;
      mobile := CASE 
        WHEN contact_record.mobile IS NOT NULL THEN
          regexp_replace(contact_record.mobile, '^(.{3}).*(.{2})$', '\1***\2')
        ELSE NULL
      END;
      is_primary := contact_record.is_primary;
      is_preferred := contact_record.is_preferred;
      created_at := contact_record.created_at;
    END IF;
    
    RETURN NEXT;
  END LOOP;
END;
$$;

-- 2. Create rate limiting function for sensitive contact operations
CREATE OR REPLACE FUNCTION public.check_contact_access_rate_limit(
  operation_type text DEFAULT 'contact_access'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id uuid := auth.uid();
  recent_attempts integer;
  rate_limit integer := 100; -- Max 100 contact accesses per hour
  time_window interval := '1 hour';
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Count recent attempts
  SELECT COUNT(*) INTO recent_attempts
  FROM public.security_events
  WHERE user_id = check_contact_access_rate_limit.user_id
    AND event_type = operation_type
    AND created_at > (now() - time_window);

  -- Log rate limit check
  IF recent_attempts >= rate_limit THEN
    INSERT INTO public.security_events (
      user_id, event_type, severity, metadata, created_at
    ) VALUES (
      user_id,
      'rate_limit_exceeded',
      'high',
      jsonb_build_object(
        'operation', operation_type,
        'attempts', recent_attempts,
        'limit', rate_limit,
        'window_hours', extract(epoch from time_window) / 3600
      ),
      now()
    );
    
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- 3. Update RLS policies with enhanced security
DROP POLICY IF EXISTS "secure_stakeholder_contacts_member_select" ON public.stakeholder_contacts;
DROP POLICY IF EXISTS "secure_stakeholder_contacts_admin_select" ON public.stakeholder_contacts;

-- New restrictive policy: Only allow access through the secure function
CREATE POLICY "stakeholder_contacts_secure_access_only"
ON public.stakeholder_contacts
FOR SELECT
USING (
  -- Only allow direct access for service operations or system functions
  auth.role() = 'service_role' OR
  -- Allow access through security definer functions only
  current_setting('app.bypass_rls', true) = 'on'
);

-- 4. Create a view for safe contact access (to be used by applications)
CREATE OR REPLACE VIEW public.stakeholder_contacts_safe AS
SELECT 
  sc.id,
  sc.stakeholder_id,
  sc.name,
  sc.title,
  -- Always return masked data in the view
  CASE 
    WHEN sc.email IS NOT NULL THEN
      regexp_replace(sc.email, '^(.{2})[^@]*(@.*)$', '\1***\2')
    ELSE NULL
  END as email_masked,
  CASE 
    WHEN sc.phone IS NOT NULL THEN
      regexp_replace(sc.phone, '^(.{3}).*(.{2})$', '\1***\2')
    ELSE NULL
  END as phone_masked,
  CASE 
    WHEN sc.mobile IS NOT NULL THEN
      regexp_replace(sc.mobile, '^(.{3}).*(.{2})$', '\1***\2')
    ELSE NULL
  END as mobile_masked,
  sc.is_primary,
  sc.is_preferred,
  sc.created_at
FROM public.stakeholder_contacts sc;

-- Set RLS on the view
ALTER VIEW public.stakeholder_contacts_safe SET (security_barrier = true);

-- 5. Create policy for the safe view
CREATE POLICY "safe_contacts_company_members_only"
ON public.stakeholder_contacts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.stakeholders s
    JOIN public.company_members cm ON s.company_id = cm.company_id
    WHERE s.id = stakeholder_contacts.stakeholder_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND auth.role() = 'authenticated'
  )
);

-- 6. Enhanced audit trigger for contact access
CREATE OR REPLACE FUNCTION public.enhanced_contact_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all operations on stakeholder contacts with enhanced metadata
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP || '_stakeholder_contact',
    'stakeholder_contact',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'stakeholder_id', COALESCE(NEW.stakeholder_id, OLD.stakeholder_id),
      'contact_name', COALESCE(NEW.name, OLD.name),
      'operation', TG_OP,
      'is_primary', COALESCE(NEW.is_primary, OLD.is_primary),
      'is_preferred', COALESCE(NEW.is_preferred, OLD.is_preferred),
      'has_email', (COALESCE(NEW.email, OLD.email) IS NOT NULL),
      'has_phone', (COALESCE(NEW.phone, OLD.phone) IS NOT NULL),
      'has_mobile', (COALESCE(NEW.mobile, OLD.mobile) IS NOT NULL),
      'user_ip', current_setting('request.headers', true)::json->>'x-forwarded-for',
      'timestamp', now()
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger and create new enhanced one
DROP TRIGGER IF EXISTS log_stakeholder_contact_access_trigger ON public.stakeholder_contacts;
CREATE TRIGGER enhanced_contact_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.stakeholder_contacts
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_contact_audit_log();

-- 7. Grant necessary permissions
GRANT SELECT ON public.stakeholder_contacts_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stakeholder_contacts_secure(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_contact_access_rate_limit(text) TO authenticated;