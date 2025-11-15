
-- Drop the broken INSERT policy
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

-- Create correct INSERT policy
-- In INSERT policies, we reference the NEW row's columns directly in WITH CHECK
CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = projects.company_id  -- Reference the NEW row's company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), projects.company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), projects.company_id, 'manage_company_projects')
);
