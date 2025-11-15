-- Fix the INSERT policy properly - in WITH CHECK for INSERT,
-- reference NEW row columns directly without table prefix
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_id  -- Reference NEW row's company_id directly
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), company_id, 'manage_company_projects')
);