-- Simplified working policy - just use permissions
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (
  is_platform_admin() 
  OR (
    user_has_permission(auth.uid(), company_id, 'manage_projects')
  )
  OR (
    user_has_permission(auth.uid(), company_id, 'manage_company_projects')
  )
);