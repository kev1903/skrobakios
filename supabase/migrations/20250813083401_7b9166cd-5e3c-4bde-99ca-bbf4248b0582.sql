-- First, let's identify and fix the problematic policies on project_members table
-- The issue is likely in the project_members table policies that reference themselves

-- Let's create a simple function that bypasses any potential recursion for project access
CREATE OR REPLACE FUNCTION public.user_can_access_project_direct(project_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_id_param 
    AND cm.user_id = user_id_param 
    AND cm.status = 'active'
  );
$$;

-- Let's also check what's causing the recursion in project_members policies
-- We need to temporarily disable RLS on project_members to break the cycle, then fix the policies

-- Disable RLS temporarily
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;

-- Re-enable with better policies
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view project members they have access to" ON public.project_members;
DROP POLICY IF EXISTS "Users can create project members in their projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can update project members they have access to" ON public.project_members;
DROP POLICY IF EXISTS "Users can delete project members they have access to" ON public.project_members;

-- Create new non-recursive policies for project_members
CREATE POLICY "Company members can view project members" 
ON public.project_members 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Company owners and admins can manage project members" 
ON public.project_members 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Now update our project_contracts function to use the simpler approach
CREATE OR REPLACE FUNCTION public.can_access_project_contracts(project_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.user_can_access_project_direct(project_id_param, auth.uid());
$$;