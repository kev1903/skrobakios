-- Proper fix: In INSERT WITH CHECK, reference columns of the NEW row directly
-- The key is that unqualified column names in the main clause refer to the NEW row
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  -- Allow if user is platform admin
  is_platform_admin() 
  -- OR if user is owner/admin of the company (using explicit subquery with NEW row's company_id)
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = (SELECT p.company_id FROM (SELECT company_id) AS p)
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  -- OR if user has the required permissions (NEW row's company_id is in scope here)
  OR user_has_permission(auth.uid(), company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), company_id, 'manage_company_projects')
);