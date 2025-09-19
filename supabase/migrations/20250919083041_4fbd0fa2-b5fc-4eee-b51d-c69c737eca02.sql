-- Fix search_path for functions that are missing it
-- Check and fix any functions without proper search_path

-- Fix generate_defect_number function
CREATE OR REPLACE FUNCTION public.generate_defect_number(project_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  project_code text;
  next_number integer;
BEGIN
  -- Get project code, fallback to 'PROJ' if not found
  SELECT COALESCE(code, 'PROJ') INTO project_code
  FROM projects 
  WHERE id = project_uuid;
  
  -- Get next defect number for this project
  SELECT COALESCE(MAX(CAST(split_part(defect_number, '-', 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM defects 
  WHERE project_id = project_uuid
  AND defect_number ~ '^DEF-[A-Z0-9]+-[0-9]+$';
  
  RETURN 'DEF-' || project_code || '-' || LPAD(next_number::text, 3, '0');
END;
$function$;

-- Fix generate_issue_number function  
CREATE OR REPLACE FUNCTION public.generate_issue_number(project_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  project_code text;
  next_number integer;
BEGIN
  -- Get project code, fallback to 'PROJ' if not found
  SELECT COALESCE(code, 'PROJ') INTO project_code
  FROM projects 
  WHERE id = project_uuid;
  
  -- Get next issue number for this project
  SELECT COALESCE(MAX(CAST(split_part(issue_number, '-', 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM issues 
  WHERE project_id = project_uuid
  AND issue_number ~ '^ISS-[A-Z0-9]+-[0-9]+$';
  
  RETURN 'ISS-' || project_code || '-' || LPAD(next_number::text, 3, '0');
END;
$function$;