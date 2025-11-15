-- Simplify the policy - remove the problematic EXISTS clause
-- Company owners/admins should have permissions granted explicitly anyway
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  is_platform_admin() 
  OR user_has_permission(auth.uid(), (SELECT company_id FROM projects WHERE false), 'manage_projects')
  OR user_has_permission(auth.uid(), (SELECT company_id FROM projects WHERE false), 'manage_company_projects')
);