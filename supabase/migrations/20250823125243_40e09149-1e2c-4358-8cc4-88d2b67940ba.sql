-- CRITICAL SECURITY FIX: Fix publicly readable leads table
-- Issue: One RLS policy has "OR true" which allows unrestricted access to customer data

-- Drop the problematic policy that allows public access
DROP POLICY IF EXISTS "Log lead contact access for security monitoring" ON public.leads;

-- Remove redundant overlapping policies  
DROP POLICY IF EXISTS "Enhanced contact field protection" ON public.leads;
DROP POLICY IF EXISTS "Only authenticated users can access leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads from their companies" ON public.leads;

-- Create a single, secure policy for lead access
-- Only company members can access leads from their companies
CREATE POLICY "company_members_only_lead_access" ON public.leads
FOR ALL USING (
  auth.role() = 'authenticated' 
  AND company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  auth.role() = 'authenticated' 
  AND company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Add function to mask sensitive contact info for enhanced security
CREATE OR REPLACE FUNCTION public.get_masked_lead_data(lead_id uuid)
RETURNS TABLE(
  id uuid,
  company_id uuid,
  company text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  value numeric,
  priority text,
  source text,
  stage text,
  location text,
  website text,
  project_address text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lead_record RECORD;
  is_company_member boolean := false;
BEGIN
  -- Get lead data
  SELECT * INTO lead_record FROM leads WHERE leads.id = lead_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if user is company member
  SELECT EXISTS(
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = lead_record.company_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  ) INTO is_company_member;
  
  -- Return data with masked contact info if not a company member
  RETURN QUERY SELECT
    lead_record.id,
    lead_record.company_id,
    lead_record.company,
    lead_record.contact_name,
    CASE 
      WHEN is_company_member THEN lead_record.contact_email
      ELSE regexp_replace(COALESCE(lead_record.contact_email, ''), '^(.{2})[^@]*(@.*)$', '\1***\2')
    END as contact_email,
    CASE 
      WHEN is_company_member THEN lead_record.contact_phone
      ELSE regexp_replace(COALESCE(lead_record.contact_phone, ''), '^(.{3}).*(.{2})$', '\1***\2')
    END as contact_phone,
    lead_record.description,
    lead_record.value,
    lead_record.priority,
    lead_record.source,
    lead_record.stage,
    lead_record.location,
    lead_record.website,
    lead_record.project_address;
END;
$function$;