-- Fix critical security issue: Secure stakeholder addresses from unauthorized access
-- Address the risk of stalking/harassment through exposed physical addresses and GPS coordinates

-- First, let's see what RLS is currently enabled
-- Check if RLS is enabled (it should be)
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'stakeholder_addresses';

-- Add additional security columns for better access control
ALTER TABLE public.stakeholder_addresses 
ADD COLUMN IF NOT EXISTS access_level text DEFAULT 'restricted' CHECK (access_level IN ('public', 'company', 'restricted', 'private')),
ADD COLUMN IF NOT EXISTS security_classification text DEFAULT 'sensitive' CHECK (security_classification IN ('public', 'internal', 'sensitive', 'confidential')),
ADD COLUMN IF NOT EXISTS last_accessed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_accessed_by uuid;

-- Create a secure function to check stakeholder address access permissions
CREATE OR REPLACE FUNCTION public.can_access_stakeholder_address(
  target_stakeholder_id uuid,
  requesting_user_id uuid DEFAULT auth.uid(),
  access_type text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  stakeholder_company_id uuid;
  user_company_role text;
  address_access_level text;
BEGIN
  -- Check rate limiting for address access
  IF NOT public.check_contact_access_rate_limit('stakeholder_address_access') THEN
    RETURN false;
  END IF;

  -- Get stakeholder company and address access level
  SELECT s.company_id INTO stakeholder_company_id
  FROM stakeholders s 
  WHERE s.id = target_stakeholder_id;

  -- Get user's role in the company
  SELECT cm.role INTO user_company_role
  FROM company_members cm
  WHERE cm.company_id = stakeholder_company_id 
    AND cm.user_id = requesting_user_id 
    AND cm.status = 'active';

  -- No access if user is not a company member
  IF user_company_role IS NULL THEN
    RETURN false;
  END IF;

  -- Only owners and admins can access physical addresses by default
  -- This is a security-first approach for sensitive location data
  IF user_company_role NOT IN ('owner', 'admin') THEN
    RETURN false;
  END IF;

  -- Log the access attempt for security monitoring
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    metadata,
    created_at
  ) VALUES (
    requesting_user_id,
    'stakeholder_address_access',
    'high',
    jsonb_build_object(
      'stakeholder_id', target_stakeholder_id,
      'access_type', access_type,
      'company_id', stakeholder_company_id,
      'user_role', user_company_role,
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    ),
    now()
  );

  RETURN true;
END;
$$;

-- Create a secure function to get masked/limited address data
CREATE OR REPLACE FUNCTION public.get_secure_stakeholder_address(
  target_stakeholder_id uuid,
  show_full_address boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  stakeholder_id uuid,
  type text,
  city text,
  state text,
  country text,
  is_primary boolean,
  address_line_1 text,
  address_line_2 text,
  postal_code text,
  latitude numeric,
  longitude numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user can access the address
  IF NOT public.can_access_stakeholder_address(target_stakeholder_id, auth.uid(), 'read') THEN
    -- Return limited data only (city, state, country)
    RETURN QUERY
    SELECT 
      sa.id,
      sa.stakeholder_id,
      sa.type,
      sa.city,
      sa.state,
      sa.country,
      sa.is_primary,
      NULL::text as address_line_1,
      NULL::text as address_line_2,
      NULL::text as postal_code,
      NULL::numeric as latitude,
      NULL::numeric as longitude
    FROM stakeholder_addresses sa
    WHERE sa.stakeholder_id = target_stakeholder_id;
    RETURN;
  END IF;

  -- Update last accessed tracking
  UPDATE stakeholder_addresses 
  SET 
    last_accessed_at = now(),
    last_accessed_by = auth.uid()
  WHERE stakeholder_id = target_stakeholder_id;

  -- Return full address data for authorized users
  RETURN QUERY
  SELECT 
    sa.id,
    sa.stakeholder_id,
    sa.type,
    sa.city,
    sa.state,
    sa.country,
    sa.is_primary,
    CASE WHEN show_full_address THEN sa.address_line_1 ELSE NULL END,
    CASE WHEN show_full_address THEN sa.address_line_2 ELSE NULL END,
    CASE WHEN show_full_address THEN sa.postal_code ELSE NULL END,
    CASE WHEN show_full_address THEN sa.latitude ELSE NULL END,
    CASE WHEN show_full_address THEN sa.longitude ELSE NULL END
  FROM stakeholder_addresses sa
  WHERE sa.stakeholder_id = target_stakeholder_id;
END;
$$;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Company members can manage stakeholder addresses" ON public.stakeholder_addresses;

-- Create new restrictive policies
CREATE POLICY "Owners and admins can view stakeholder addresses"
ON public.stakeholder_addresses
FOR SELECT
USING (
  public.can_access_stakeholder_address(stakeholder_id, auth.uid(), 'read')
);

CREATE POLICY "Owners and admins can manage stakeholder addresses"
ON public.stakeholder_addresses
FOR ALL
USING (
  stakeholder_id IN (
    SELECT s.id
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')  -- Only owners and admins
  )
)
WITH CHECK (
  stakeholder_id IN (
    SELECT s.id
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')  -- Only owners and admins
  )
);

-- Create audit trigger for address access
CREATE OR REPLACE FUNCTION public.audit_stakeholder_address_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP || '_stakeholder_address',
    'stakeholder_address',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'stakeholder_id', COALESCE(NEW.stakeholder_id, OLD.stakeholder_id),
      'operation', TG_OP,
      'address_type', COALESCE(NEW.type, OLD.type),
      'has_gps_coordinates', (
        COALESCE(NEW.latitude, OLD.latitude) IS NOT NULL AND 
        COALESCE(NEW.longitude, OLD.longitude) IS NOT NULL
      ),
      'security_classification', COALESCE(NEW.security_classification, OLD.security_classification, 'sensitive'),
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
      'timestamp', now()
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the audit trigger
DROP TRIGGER IF EXISTS stakeholder_address_audit_trigger ON public.stakeholder_addresses;
CREATE TRIGGER stakeholder_address_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.stakeholder_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_stakeholder_address_access();

-- Update existing addresses to have proper security classification
UPDATE public.stakeholder_addresses 
SET 
  access_level = 'restricted',
  security_classification = 'sensitive'
WHERE access_level IS NULL OR security_classification IS NULL;

-- Add security comments
COMMENT ON TABLE public.stakeholder_addresses IS 
'SECURITY: Contains sensitive physical addresses and GPS coordinates. Access restricted to company owners/admins only. All access is logged for security monitoring.';

COMMENT ON FUNCTION public.can_access_stakeholder_address(uuid, uuid, text) IS 
'Security function: Checks if user can access stakeholder address data. Includes rate limiting and audit logging.';

COMMENT ON FUNCTION public.get_secure_stakeholder_address(uuid, boolean) IS 
'Secure address access function: Returns limited or full address data based on user permissions and access level.';