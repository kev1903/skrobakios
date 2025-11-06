-- Drop the problematic policy
DROP POLICY IF EXISTS "projects_visible_to_members_and_admins" ON public.projects;

-- Create a security definer function to check project membership
-- This function bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION public.user_can_see_project(project_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Superadmins can see all projects
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = user_id_param
    AND ur.role = 'superadmin'
  )
  OR EXISTS (
    -- Users who are active members of the project can see it
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_id_param
    AND pm.user_id = user_id_param
    AND pm.status = 'active'
  )
  OR EXISTS (
    -- Company owners/admins can see all projects in their companies
    SELECT 1 FROM public.company_members cm
    INNER JOIN public.projects p ON p.company_id = cm.company_id
    WHERE p.id = project_id_param
    AND cm.user_id = user_id_param
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  );
$$;

-- Create the new RLS policy using the security definer function
CREATE POLICY "projects_select_by_membership"
ON public.projects
FOR SELECT
TO authenticated
USING (
  public.user_can_see_project(id, auth.uid())
);