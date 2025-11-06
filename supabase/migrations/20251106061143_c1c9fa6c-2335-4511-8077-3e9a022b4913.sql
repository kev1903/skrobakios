-- Drop the problematic RLS policy on projects that causes infinite recursion
DROP POLICY IF EXISTS "projects_select_project_members_only" ON public.projects;

-- Drop the helper function that was causing issues
DROP FUNCTION IF EXISTS public.is_project_member_secure(uuid, uuid);

-- Create a new RLS policy for projects that avoids recursion
-- This policy checks project_members WITHOUT using another policy check
CREATE POLICY "projects_visible_to_members_and_admins"
ON public.projects
FOR SELECT
USING (
  -- Superadmins can see all projects
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
  )
  OR
  -- Users who are active members of the project can see it
  EXISTS (
    SELECT 1 
    FROM public.project_members pm
    WHERE pm.project_id = projects.id
    AND pm.user_id = auth.uid()
    AND pm.status = 'active'
  )
  OR
  -- Company owners/admins can see all projects in their companies
  EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = projects.company_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
);

-- Ensure project_members RLS is properly configured without causing recursion
DROP POLICY IF EXISTS "project_members_select_policy" ON public.project_members;

CREATE POLICY "project_members_visible_to_all_authenticated"
ON public.project_members
FOR SELECT
TO authenticated
USING (true); -- Allow all authenticated users to read project_members for access checks

-- Only allow insert/update/delete by authorized users
DROP POLICY IF EXISTS "project_members_insert_policy" ON public.project_members;
CREATE POLICY "project_members_insert_policy"
ON public.project_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = (SELECT company_id FROM public.projects WHERE id = project_members.project_id)
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
);

DROP POLICY IF EXISTS "project_members_update_policy" ON public.project_members;
CREATE POLICY "project_members_update_policy"
ON public.project_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = (SELECT company_id FROM public.projects WHERE id = project_members.project_id)
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
);

DROP POLICY IF EXISTS "project_members_delete_policy" ON public.project_members;
CREATE POLICY "project_members_delete_policy"
ON public.project_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = (SELECT company_id FROM public.projects WHERE id = project_members.project_id)
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
);