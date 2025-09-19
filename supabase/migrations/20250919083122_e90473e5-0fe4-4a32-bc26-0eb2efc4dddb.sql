-- Drop existing functions and recreate with proper search_path
DROP FUNCTION IF EXISTS public.generate_defect_number(uuid);
DROP FUNCTION IF EXISTS public.generate_issue_number(uuid);

-- Recreate generate_defect_number function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_defect_number(project_id_param uuid)
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
  WHERE id = project_id_param;
  
  -- Get next defect number for this project
  SELECT COALESCE(MAX(CAST(split_part(defect_number, '-', 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM defects 
  WHERE project_id = project_id_param
  AND defect_number ~ '^DEF-[A-Z0-9]+-[0-9]+$';
  
  RETURN 'DEF-' || project_code || '-' || LPAD(next_number::text, 3, '0');
END;
$function$;

-- Recreate generate_issue_number function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_issue_number(project_id_param uuid)
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
  WHERE id = project_id_param;
  
  -- Get next issue number for this project
  SELECT COALESCE(MAX(CAST(split_part(issue_number, '-', 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM issues 
  WHERE project_id = project_id_param
  AND issue_number ~ '^ISS-[A-Z0-9]+-[0-9]+$';
  
  RETURN 'ISS-' || project_code || '-' || LPAD(next_number::text, 3, '0');
END;
$function$;