-- Enhanced Security Fix for Leads Contact Information (Corrected)
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
BEGIN
  -- Return leads with conditionally masked contact information
  RETURN QUERY
  SELECT 
    l.id,
    l.company_id,
    l.company,
    l.contact_name,
    -- Mask email if user doesn't have permission
    CASE 
      WHEN public.user_can_view_lead_contacts(current_user_id, l.company_id) 
      THEN l.contact_email
      ELSE public.mask_contact_info(l.contact_email)
    END as contact_email,
    -- Mask phone if user doesn't have permission  
    CASE 
      WHEN public.user_can_view_lead_contacts(current_user_id, l.company_id)
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

-- Drop the existing problematic policy and create a stricter one
DROP POLICY IF EXISTS "Restrict contact field access to authorized users" ON public.leads;

-- Create enhanced RLS policy that restricts direct table access
CREATE POLICY "Enhanced contact field protection" ON public.leads
FOR SELECT USING (
  -- Only allow access through proper channels with company membership
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);