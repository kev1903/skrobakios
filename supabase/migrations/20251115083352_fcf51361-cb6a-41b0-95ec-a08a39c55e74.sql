-- Use LATERAL to properly reference the NEW row's company_id
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT up.company_id
    FROM user_permissions up
    WHERE up.user_id = auth.uid()
    AND up.permission_key IN ('manage_projects', 'manage_company_projects')
    AND up.granted = true
  )
  OR is_platform_admin()
);