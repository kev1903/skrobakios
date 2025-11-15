-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "projects_manage_admins_secure_v3" ON projects;

-- Create separate policies for better permission control
-- Policy for INSERT: Allow platform admins, company admins/owners, OR users with projects.create permission
CREATE POLICY "projects_insert_with_permission"
ON projects
FOR INSERT
TO public
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), projects.company_id, 'projects.create')
);

-- Policy for UPDATE: Allow platform admins, company admins/owners, OR users with projects.edit permission
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
  OR user_has_permission(auth.uid(), projects.company_id, 'projects.edit')
)
WITH CHECK (
  is_platform_admin() 
  OR EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
  )
  OR user_has_permission(auth.uid(), projects.company_id, 'projects.edit')
);

-- Policy for DELETE: Only allow platform admins and company admins/owners
CREATE POLICY "projects_delete_admins_only"
ON projects
FOR DELETE
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
);