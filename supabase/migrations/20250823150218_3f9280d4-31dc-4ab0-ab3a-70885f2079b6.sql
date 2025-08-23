-- Update user's company membership to active for Skrobaki PM company
UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id = '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5';

-- Also ensure they can see the project contracts by updating the RLS policy to be more explicit
DROP POLICY IF EXISTS "users_can_view_project_contracts" ON project_contracts;

CREATE POLICY "users_can_view_project_contracts" 
ON project_contracts 
FOR SELECT 
USING (
  -- User must be authenticated and a member of the company that owns the project
  auth.role() = 'authenticated' AND 
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);