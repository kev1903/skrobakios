-- Create more granular RLS policies for stakeholder_contacts table
-- Replace the current overly permissive policy with more secure ones

-- First, drop the existing overly broad policy
DROP POLICY IF EXISTS "Company members can manage stakeholder contacts" ON public.stakeholder_contacts;

-- Create separate policies for different operations with stricter access control

-- Policy 1: Company owners and admins can view all stakeholder contacts
CREATE POLICY "Company owners and admins can view all stakeholder contacts"
ON public.stakeholder_contacts
FOR SELECT
TO authenticated
USING (
  stakeholder_id IN (
    SELECT s.id
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Policy 2: Regular company members can only view primary/preferred contacts (limited sensitive data exposure)
CREATE POLICY "Company members can view primary contacts only"
ON public.stakeholder_contacts
FOR SELECT
TO authenticated
USING (
  (is_primary = true OR is_preferred = true)
  AND stakeholder_id IN (
    SELECT s.id
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND cm.role = 'member'
  )
);

-- Policy 3: Only company owners and admins can insert stakeholder contacts
CREATE POLICY "Company owners and admins can insert stakeholder contacts"
ON public.stakeholder_contacts
FOR INSERT
TO authenticated
WITH CHECK (
  stakeholder_id IN (
    SELECT s.id
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Policy 4: Only company owners and admins can update stakeholder contacts
CREATE POLICY "Company owners and admins can update stakeholder contacts"
ON public.stakeholder_contacts
FOR UPDATE
TO authenticated
USING (
  stakeholder_id IN (
    SELECT s.id
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  stakeholder_id IN (
    SELECT s.id
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Policy 5: Only company owners and admins can delete stakeholder contacts
CREATE POLICY "Company owners and admins can delete stakeholder contacts"
ON public.stakeholder_contacts
FOR DELETE
TO authenticated
USING (
  stakeholder_id IN (
    SELECT s.id
    FROM stakeholders s
    JOIN company_members cm ON s.company_id = cm.company_id
    WHERE cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Add audit logging trigger for sensitive contact access
CREATE OR REPLACE FUNCTION log_stakeholder_contact_access()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;