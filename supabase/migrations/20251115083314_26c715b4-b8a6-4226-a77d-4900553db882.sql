-- Fix: Remove table qualifier in WITH CHECK - unqualified column names refer to NEW row
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM user_permissions up
    WHERE up.user_id = auth.uid()
    AND up.company_id = company_id  -- No table qualifier! Refers to NEW row's company_id
    AND up.permission_key IN ('manage_projects', 'manage_company_projects')
    AND up.granted = true
  )
  OR is_platform_admin()
);