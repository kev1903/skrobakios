-- Fix infinite recursion in projects RLS policies
-- Similar to the company_members issue, these policies are causing recursive queries

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Strict company isolation for projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects in their companies" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their companies" ON projects;
DROP POLICY IF EXISTS "Users can delete projects in their companies" ON projects;

-- Create security definer functions to safely check project access
CREATE OR REPLACE FUNCTION public.can_view_company_projects(target_company_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_members cm
    WHERE cm.company_id = target_company_id
    AND cm.user_id = target_user_id
    AND cm.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_company_projects(target_company_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_members cm
    WHERE cm.company_id = target_company_id
    AND cm.user_id = target_user_id
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  );
$$;

-- Recreate policies using security definer functions
CREATE POLICY "Users can view projects from their companies" 
ON projects 
FOR SELECT 
TO authenticated
USING (can_view_company_projects(company_id, auth.uid()));

CREATE POLICY "Users can create projects in their companies" 
ON projects 
FOR INSERT 
TO authenticated
WITH CHECK (can_manage_company_projects(company_id, auth.uid()));

CREATE POLICY "Users can update projects in their companies" 
ON projects 
FOR UPDATE 
TO authenticated
USING (can_manage_company_projects(company_id, auth.uid()))
WITH CHECK (can_manage_company_projects(company_id, auth.uid()));

CREATE POLICY "Users can delete projects in their companies" 
ON projects 
FOR DELETE 
TO authenticated
USING (can_manage_company_projects(company_id, auth.uid()));