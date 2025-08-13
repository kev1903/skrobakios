-- COMPLETE FIX FOR INFINITE RECURSION IN PROJECT_CONTRACTS

-- First, let's completely recreate the project_contracts table with simpler RLS
-- that doesn't depend on complex joins that could cause recursion

-- Drop existing RLS policies on project_contracts
DROP POLICY IF EXISTS "Users can delete project contracts they have access to" ON public.project_contracts;
DROP POLICY IF EXISTS "Users can insert project contracts they have access to" ON public.project_contracts;
DROP POLICY IF EXISTS "Users can update project contracts they have access to" ON public.project_contracts;
DROP POLICY IF EXISTS "Users can view project contracts they have access to" ON public.project_contracts;

-- Create completely simple, non-recursive policies
-- Policy 1: Users can view contracts for projects in their companies
CREATE POLICY "view_project_contracts_simple" 
ON public.project_contracts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_contracts.project_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

-- Policy 2: Users can insert contracts for projects in their companies
CREATE POLICY "insert_project_contracts_simple" 
ON public.project_contracts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_contracts.project_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

-- Policy 3: Users can update contracts for projects in their companies
CREATE POLICY "update_project_contracts_simple" 
ON public.project_contracts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_contracts.project_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

-- Policy 4: Users can delete contracts for projects in their companies  
CREATE POLICY "delete_project_contracts_simple" 
ON public.project_contracts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_contracts.project_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

-- Also fix any remaining project_members recursion by ensuring simple policies
-- Drop and recreate project_members policies to be absolutely sure
DROP POLICY IF EXISTS "Company members can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Company owners and admins can manage project members" ON public.project_members;

-- Simple project members policies without any recursion potential
CREATE POLICY "view_project_members_by_company" 
ON public.project_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_members.project_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

CREATE POLICY "manage_project_members_by_company_admin" 
ON public.project_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_members.project_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Update the function to be even simpler
CREATE OR REPLACE FUNCTION public.can_access_project_contracts(project_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_id_param
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  );
$$;