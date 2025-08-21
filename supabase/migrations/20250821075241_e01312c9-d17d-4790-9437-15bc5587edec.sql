-- Add a restrictive SELECT policy to ensure company scoping regardless of other permissive policies
-- This prevents projects from leaking across companies due to other broad policies

CREATE POLICY IF NOT EXISTS "Restrict projects to company membership or scoped permission"
AS RESTRICTIVE
ON public.projects
FOR SELECT
TO authenticated
USING (
  -- Active membership in the same company as the project
  EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = public.projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
  OR
  -- Explicit company-scoped permission to view projects
  EXISTS (
    SELECT 1
    FROM public.user_permissions up
    WHERE up.company_id = public.projects.company_id
      AND up.user_id = auth.uid()
      AND up.permission_key = 'view_projects'
      AND up.granted = true
  )
  OR
  -- Superadmins can see all projects
  public.is_superadmin(auth.uid())
);
