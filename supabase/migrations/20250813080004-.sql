-- Check if there are any recursive policies on project_members table that might be causing the issue
-- Let's also ensure our function doesn't reference project_members directly to avoid recursion

-- First, let's create a simpler approach - check company membership directly
CREATE OR REPLACE FUNCTION public.can_access_project_contracts(project_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_company_id uuid;
  user_company_member boolean := false;
BEGIN
  -- Get the company_id for this project
  SELECT company_id INTO project_company_id 
  FROM projects 
  WHERE id = project_id_param;
  
  -- Check if user is a member of that company
  SELECT EXISTS (
    SELECT 1 
    FROM company_members cm
    WHERE cm.company_id = project_company_id 
    AND cm.user_id = auth.uid() 
    AND cm.status = 'active'
  ) INTO user_company_member;
  
  RETURN user_company_member;
END;
$$;

-- Let's also check if there are any problematic policies on project_members that could cause recursion
-- We need to see what policies exist first