-- Fix search_path issues for key functions that may be missing it
-- Update generate_issue_number function
CREATE OR REPLACE FUNCTION public.generate_issue_number(target_project_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_number integer;
BEGIN
  SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(issue_number, '^[A-Z]+-', '') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.issues
  WHERE project_id = target_project_id;
  
  RETURN 'ISS-' || LPAD(next_number::text, 4, '0');
END;
$$;

-- Update generate_defect_number function  
CREATE OR REPLACE FUNCTION public.generate_defect_number(target_project_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_number integer;
BEGIN
  SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(defect_number, '^[A-Z]+-', '') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.defects
  WHERE project_id = target_project_id;
  
  RETURN 'DEF-' || LPAD(next_number::text, 4, '0');
END;
$$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, severity text, metadata jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_events (user_id, event_type, severity, metadata, created_at)
  VALUES (auth.uid(), event_type, severity, metadata, now());
END;
$$;

-- Update mask_contact_info function
CREATE OR REPLACE FUNCTION public.mask_contact_info(contact_info text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF contact_info IS NULL OR length(contact_info) < 4 THEN
    RETURN '***';
  END IF;
  
  -- For email addresses
  IF contact_info LIKE '%@%' THEN
    RETURN substring(contact_info from 1 for 2) || '***@' || split_part(contact_info, '@', 2);
  END IF;
  
  -- For phone numbers or other contact info
  RETURN substring(contact_info from 1 for 2) || repeat('*', length(contact_info) - 4) || substring(contact_info from length(contact_info) - 1);
END;
$$;

-- Update is_company_member function
CREATE OR REPLACE FUNCTION public.is_company_member(target_company_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.company_members cm
    WHERE cm.company_id = target_company_id 
    AND cm.user_id = target_user_id 
    AND cm.status = 'active'
  );
END;
$$;