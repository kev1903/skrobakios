-- Fix the projects RLS policy to properly scope permissions to specific companies
DROP POLICY IF EXISTS "Users can view projects by membership or permission" ON public.projects;

CREATE POLICY "Users can view projects from their companies or with permission"
ON public.projects
FOR SELECT
TO authenticated
USING (
  -- Active company membership access
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
  OR
  -- User has explicit 'view_projects' permission for THIS specific company
  public.user_has_permission(
    permission_key_param => 'view_projects',
    target_company_id    => company_id,  -- This ensures it's scoped to the project's company
    target_user_id       => auth.uid()
  ) = true
  OR
  -- Always allow superadmins
  public.is_superadmin(auth.uid())
);