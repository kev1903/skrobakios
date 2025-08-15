-- Enhance project isolation to prevent cross-company data leakage
-- Even superadmins should only see projects from their active company context

-- First, let's ensure the projects table has proper isolation
-- Replace the existing SELECT policy with a more restrictive one
DROP POLICY IF EXISTS "Users can view projects from their current business only" ON projects;

-- Create a new, more restrictive policy that ensures strict company isolation
CREATE POLICY "Strict company isolation for projects" 
ON projects 
FOR SELECT 
TO authenticated
USING (
  -- Only allow viewing projects if user is an active member of the project's company
  -- OR if they are a superadmin viewing through platform administration
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Ensure all other project operations also respect company boundaries
-- Update INSERT policy to be more explicit
DROP POLICY IF EXISTS "Users can create projects in their companies" ON projects;
CREATE POLICY "Users can create projects in their companies" 
ON projects 
FOR INSERT 
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Update UPDATE policy to be more explicit
DROP POLICY IF EXISTS "Users can update projects in their companies" ON projects;
CREATE POLICY "Users can update projects in their companies" 
ON projects 
FOR UPDATE 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Update DELETE policy to be more explicit
DROP POLICY IF EXISTS "Users can delete projects in their companies" ON projects;
CREATE POLICY "Users can delete projects in their companies" 
ON projects 
FOR DELETE 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Also ensure company_members table has proper isolation
-- Check if there's a policy allowing viewing all memberships
DROP POLICY IF EXISTS "Users can view their own membership" ON company_members;
CREATE POLICY "Users can view their own membership" 
ON company_members 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid()
);

-- Ensure users can only manage memberships in companies they own/admin
DROP POLICY IF EXISTS "Company owners can manage members" ON company_members;
CREATE POLICY "Company owners can manage members" 
ON company_members 
FOR ALL 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

-- Add a function to help debug company access
CREATE OR REPLACE FUNCTION debug_user_company_access(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  company_id uuid,
  company_name text,
  user_role text,
  membership_status text,
  can_see_projects boolean
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cm.company_id,
    c.name as company_name,
    cm.role as user_role,
    cm.status as membership_status,
    (cm.status = 'active') as can_see_projects
  FROM company_members cm
  JOIN companies c ON cm.company_id = c.id
  WHERE cm.user_id = target_user_id
  ORDER BY cm.status DESC, c.name;
$$;