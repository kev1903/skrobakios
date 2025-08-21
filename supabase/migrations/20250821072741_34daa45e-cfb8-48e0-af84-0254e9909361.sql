-- Allow users with 'view_projects' permission (or superadmin) to view projects even if not active company members
-- Update the SELECT policy on public.projects accordingly

DROP POLICY IF EXISTS "Users can view projects from their companies" ON public.projects;

CREATE POLICY "Users can view projects by membership or permission"
ON public.projects
FOR SELECT
TO authenticated
USING (
  -- Existing membership-based access
  public.can_view_company_projects(company_id, auth.uid())
  OR
  -- New: explicit permission at company level
  public.user_has_permission(
    permission_key_param => 'view_projects',
    target_company_id    => company_id,
    target_user_id       => auth.uid()
  )
  OR
  -- Always allow superadmins
  public.is_superadmin(auth.uid())
);
