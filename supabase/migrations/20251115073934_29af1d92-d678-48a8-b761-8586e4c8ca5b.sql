
-- Drop the policies with incorrect permission keys
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;
DROP POLICY IF EXISTS "projects_update_with_permission" ON projects;

-- Create INSERT policy with correct permission keys
CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), company_id, 'manage_company_projects')
);

-- Create UPDATE policy with correct permission keys
CREATE POLICY "projects_update_with_permission"
ON projects
FOR UPDATE
TO public
USING (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), projects.company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), projects.company_id, 'manage_company_projects')
)
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), company_id, 'manage_company_projects')
);
