-- Replace overly permissive project SELECT policy with company-scoped one
DROP POLICY IF EXISTS "Users can view projects from their companies or with permission" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects by membership or permission" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects from their companies" ON public.projects;

CREATE POLICY "Projects: view by membership or scoped permission"
ON public.projects
FOR SELECT
TO authenticated
USING (
  -- Membership in the same company
  EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = public.projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
  OR
  -- Explicit permission scoped to the project's company
  EXISTS (
    SELECT 1
    FROM public.user_permissions up
    WHERE up.company_id = public.projects.company_id
      AND up.user_id = auth.uid()
      AND up.permission_key = 'view_projects'
      AND up.granted = true
  )
  OR
  -- Superadmins can see all
  public.is_superadmin(auth.uid())
);