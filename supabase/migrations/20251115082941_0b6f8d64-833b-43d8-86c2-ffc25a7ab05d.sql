-- Final fix: Simplified policy that will definitely work
-- Remove all complex logic and just check permissions directly
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM user_permissions up
    WHERE up.user_id = auth.uid()
    AND up.company_id = projects.company_id
    AND up.permission_key IN ('manage_projects', 'manage_company_projects')
    AND up.granted = true
  )
  OR is_platform_admin()
);