-- Fix the INSERT policy - the bug is cm.company_id = cm.company_id
-- It should compare against the NEW row's company_id being inserted
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = projects.company_id  -- Compare to NEW row's company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), projects.company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), projects.company_id, 'manage_company_projects')
);