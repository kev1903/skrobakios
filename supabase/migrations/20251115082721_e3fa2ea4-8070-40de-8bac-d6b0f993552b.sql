-- Fix the ambiguous column reference by using a CTE or explicit naming
-- The issue is that inside EXISTS, 'company_id' resolves to cm.company_id
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = projects.company_id  -- Must use projects.company_id for INSERT NEW row
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), projects.company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), projects.company_id, 'manage_company_projects')
);