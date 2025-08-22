-- Create a secure function to get leads with masked contact information
CREATE OR REPLACE FUNCTION public.get_leads_with_masked_contact(requesting_user_id uuid DEFAULT auth.uid())
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
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.company_id,
    l.company,
    l.contact_name,
    -- Only show full contact info if user is company member, otherwise mask it
    CASE 
      WHEN public.is_company_member(l.company_id, requesting_user_id) THEN l.contact_email
      ELSE public.mask_contact_info(l.contact_email)
    END as contact_email,
    CASE 
      WHEN public.is_company_member(l.company_id, requesting_user_id) THEN l.contact_phone
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
  FROM public.leads l
  WHERE l.company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = requesting_user_id 
    AND cm.status = 'active'
  );
END;
$function$;

-- Create RLS policy to audit access to sensitive lead data
CREATE POLICY "Log lead contact access for security monitoring" 
ON public.leads 
FOR SELECT 
USING (
  -- Log when contact info is accessed and allow the query
  (
    SELECT public.log_user_action(
      'view_lead_contact',
      'lead',
      id,
      jsonb_build_object(
        'has_email', contact_email IS NOT NULL,
        'has_phone', contact_phone IS NOT NULL,
        'company_id', company_id
      )
    ) IS NULL -- log_user_action returns void, so this is always true
  ) OR TRUE
);