-- Fix infinite recursion in project_contracts policies by using security definer functions

-- Create security definer function to check if user can access project
CREATE OR REPLACE FUNCTION public.can_access_project_contracts(project_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_id_param 
    AND cm.user_id = auth.uid() 
    AND cm.status = 'active'
  );
END;
$$;

-- Drop existing policies on project_contracts
DROP POLICY IF EXISTS "Users can view project contracts they have access to" ON public.project_contracts;
DROP POLICY IF EXISTS "Users can create project contracts in their projects" ON public.project_contracts;
DROP POLICY IF EXISTS "Users can update project contracts they have access to" ON public.project_contracts;
DROP POLICY IF EXISTS "Users can delete project contracts they have access to" ON public.project_contracts;

-- Create new policies using the security definer function
CREATE POLICY "Users can view project contracts they have access to" 
ON public.project_contracts 
FOR SELECT 
USING (public.can_access_project_contracts(project_id));

CREATE POLICY "Users can create project contracts in their projects" 
ON public.project_contracts 
FOR INSERT 
WITH CHECK (public.can_access_project_contracts(project_id));

CREATE POLICY "Users can update project contracts they have access to" 
ON public.project_contracts 
FOR UPDATE 
USING (public.can_access_project_contracts(project_id));

CREATE POLICY "Users can delete project contracts they have access to" 
ON public.project_contracts 
FOR DELETE 
USING (public.can_access_project_contracts(project_id));