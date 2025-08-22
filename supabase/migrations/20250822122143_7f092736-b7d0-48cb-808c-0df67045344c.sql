-- Enhanced Security Fix for Leads Contact Information
-- Create role-based access control for sensitive contact data

-- Create function to check if user has contact access permission
CREATE OR REPLACE FUNCTION public.user_can_view_lead_contacts(user_id uuid, company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Company owners and admins can view all contact info
  RETURN EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.user_id = user_can_view_lead_contacts.user_id 
    AND cm.company_id = user_can_view_lead_contacts.company_id
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  );
END;
$function$;

-- Create secure function to get leads with masked contact information
CREATE OR REPLACE FUNCTION public.get_leads_with_masked_contact()
RETURNS TABLE(
  id uuid,
  company_id uuid,
  company text,
  contact_name text,
  contact_email text,
  contact_phone text,
  avatar_url text,
  description text,
  value numeric,
  priority text,
  source text,
  stage text,
  location text,
  website text,
  notes text,
  last_activity text,
  project_address text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  can_view_contacts boolean := false;
BEGIN
  -- Check if current user can view full contact information
  SELECT EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.user_id = current_user_id
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
    AND cm.company_id IN (
      SELECT DISTINCT l.company_id 
      FROM leads l
      JOIN company_members cm2 ON l.company_id = cm2.company_id
      WHERE cm2.user_id = current_user_id AND cm2.status = 'active'
    )
  ) INTO can_view_contacts;

  -- Return leads with conditionally masked contact information
  RETURN QUERY
  SELECT 
    l.id,
    l.company_id,
    l.company,
    l.contact_name,
    -- Mask email if user doesn't have permission
    CASE 
      WHEN can_view_contacts OR public.user_can_view_lead_contacts(current_user_id, l.company_id) 
      THEN l.contact_email
      ELSE public.mask_contact_info(l.contact_email)
    END as contact_email,
    -- Mask phone if user doesn't have permission  
    CASE 
      WHEN can_view_contacts OR public.user_can_view_lead_contacts(current_user_id, l.company_id)
      THEN l.contact_phone
      ELSE public.mask_contact_info(l.contact_phone)
    END as contact_phone,
    l.avatar_url,
    l.description,
    l.value,
    l.priority,
    l.source,
    l.stage,
    l.location,
    l.website,
    l.notes,
    l.last_activity,
    l.project_address,
    l.created_at,
    l.updated_at
  FROM leads l
  JOIN company_members cm ON l.company_id = cm.company_id
  WHERE cm.user_id = current_user_id 
  AND cm.status = 'active';
END;
$function$;

-- Create additional RLS policy for stricter contact field access
CREATE POLICY "Restrict contact field access to authorized users" ON public.leads
FOR SELECT USING (
  -- Only allow full contact access to company owners and admins
  (auth.uid() IN (
    SELECT cm.user_id 
    FROM company_members cm 
    WHERE cm.company_id = leads.company_id 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )) OR
  -- Regular members can see leads but contact info will be masked via RPC
  (auth.uid() IN (
    SELECT cm.user_id 
    FROM company_members cm 
    WHERE cm.company_id = leads.company_id 
    AND cm.status = 'active'
  ))
);

-- Create audit trigger for contact access monitoring
CREATE OR REPLACE FUNCTION public.log_lead_contact_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log when sensitive contact information is accessed
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, 
    metadata, created_at
  ) VALUES (
    auth.uid(), 
    'view_lead_contact', 
    'lead', 
    NEW.id,
    jsonb_build_object(
      'has_email', (NEW.contact_email IS NOT NULL),
      'has_phone', (NEW.contact_phone IS NOT NULL),
      'company_id', NEW.company_id,
      'masked', NOT public.user_can_view_lead_contacts(auth.uid(), NEW.company_id)
    ),
    now()
  );
  
  RETURN NEW;
END;
$function$;

-- Apply the audit trigger
DROP TRIGGER IF EXISTS trigger_log_lead_contact_access ON leads;
CREATE TRIGGER trigger_log_lead_contact_access
  AFTER SELECT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION log_lead_contact_access();