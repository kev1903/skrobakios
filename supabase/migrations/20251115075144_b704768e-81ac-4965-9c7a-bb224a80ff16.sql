
-- Fix the INSERT policy to properly reference the NEW row's company_id
DROP POLICY IF EXISTS "projects_insert_with_permission" ON projects;

CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_id  -- Reference NEW row's company_id directly
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), company_id, 'manage_company_projects')
);

-- Also fix the UPDATE policy's WITH CHECK clause (it had cm.company_id = cm.company_id bug)
DROP POLICY IF EXISTS "projects_update_with_permission" ON projects;

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
    WHERE cm.company_id = company_id  -- Reference NEW row's company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), company_id, 'manage_projects')
  OR user_has_permission(auth.uid(), company_id, 'manage_company_projects')
);
