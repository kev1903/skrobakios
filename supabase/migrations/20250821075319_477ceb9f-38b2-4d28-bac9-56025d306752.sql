-- Drop existing permissive policy and create a proper restrictive policy
DROP POLICY IF EXISTS "Users can view projects from their companies or with permission" ON public.projects;

-- Create a restrictive policy that properly scopes projects to companies
CREATE POLICY "Restrict projects to company scope"
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

-- Now create a permissive policy for basic access
CREATE POLICY "Users can view projects with proper access"
ON public.projects
FOR SELECT
TO authenticated
USING (true); -- This will be restricted by the restrictive policy above