-- Fix stakeholder_contacts RLS security issue
-- The current policies have gaps that could allow unauthorized access

-- First, let's drop the existing policies to recreate them more securely
DROP POLICY IF EXISTS "Company members can view primary contacts only" ON stakeholder_contacts;
DROP POLICY IF EXISTS "Company owners and admins can view all stakeholder contacts" ON stakeholder_contacts;
DROP POLICY IF EXISTS "Company owners and admins can delete stakeholder contacts" ON stakeholder_contacts;
DROP POLICY IF EXISTS "Company owners and admins can insert stakeholder contacts" ON stakeholder_contacts;
DROP POLICY IF EXISTS "Company owners and admins can update stakeholder contacts" ON stakeholder_contacts;

-- Create a security definer function to check stakeholder access
CREATE OR REPLACE FUNCTION public.can_access_stakeholder_contacts(target_stakeholder_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow authenticated users who are active company members
  RETURN EXISTS (
    SELECT 1 
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE s.id = target_stakeholder_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND auth.role() = 'authenticated'
  );
END;
$$;

-- Create a function to check if user can manage stakeholder contacts (owners/admins only)
CREATE OR REPLACE FUNCTION public.can_manage_stakeholder_contacts(target_stakeholder_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow authenticated company owners/admins
  RETURN EXISTS (
    SELECT 1 
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE s.id = target_stakeholder_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
    AND auth.role() = 'authenticated'
  );
END;
$$;

-- Create secure RLS policies
-- Policy 1: Company owners and admins can view all stakeholder contacts
CREATE POLICY "secure_stakeholder_contacts_admin_select"
ON stakeholder_contacts FOR SELECT
TO authenticated
USING (public.can_manage_stakeholder_contacts(stakeholder_id));

-- Policy 2: Company members can view only primary/preferred contacts
CREATE POLICY "secure_stakeholder_contacts_member_select"
ON stakeholder_contacts FOR SELECT
TO authenticated
USING (
  (is_primary = true OR is_preferred = true) 
  AND public.can_access_stakeholder_contacts(stakeholder_id)
);

-- Policy 3: Only company owners/admins can insert contacts
CREATE POLICY "secure_stakeholder_contacts_insert"
ON stakeholder_contacts FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_stakeholder_contacts(stakeholder_id));

-- Policy 4: Only company owners/admins can update contacts
CREATE POLICY "secure_stakeholder_contacts_update"
ON stakeholder_contacts FOR UPDATE
TO authenticated
USING (public.can_manage_stakeholder_contacts(stakeholder_id))
WITH CHECK (public.can_manage_stakeholder_contacts(stakeholder_id));

-- Policy 5: Only company owners/admins can delete contacts
CREATE POLICY "secure_stakeholder_contacts_delete"
ON stakeholder_contacts FOR DELETE
TO authenticated
USING (public.can_manage_stakeholder_contacts(stakeholder_id));

-- Add a trigger for security event logging when sensitive contact data is accessed
CREATE OR REPLACE FUNCTION public.log_stakeholder_contact_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive contact information
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    'stakeholder_contact_access',
    'stakeholder_contact',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'stakeholder_id', COALESCE(NEW.stakeholder_id, OLD.stakeholder_id),
      'contact_name', COALESCE(NEW.name, OLD.name),
      'access_type', TG_OP,
      'is_primary', COALESCE(NEW.is_primary, OLD.is_primary),
      'has_sensitive_data', CASE 
        WHEN COALESCE(NEW.email, OLD.email) IS NOT NULL 
        OR COALESCE(NEW.phone, OLD.phone) IS NOT NULL 
        OR COALESCE(NEW.mobile, OLD.mobile) IS NOT NULL 
        THEN true 
        ELSE false 
      END
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the audit trigger for stakeholder contacts access
DROP TRIGGER IF EXISTS stakeholder_contact_audit_trigger ON stakeholder_contacts;
CREATE TRIGGER stakeholder_contact_audit_trigger
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON stakeholder_contacts
  FOR EACH ROW EXECUTE FUNCTION log_stakeholder_contact_access();