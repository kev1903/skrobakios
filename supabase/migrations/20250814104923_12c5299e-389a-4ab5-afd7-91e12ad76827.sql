-- Move "5 Thanet Street" project to Skrobaki PM company
UPDATE projects 
SET company_id = '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'
WHERE name = '5 Thanet Street, Malvern VIC 3144';

-- Verify the RLS policies on projects table are properly configured
-- Check if project visibility is correctly restricted by company membership

-- Update RLS policy to ensure strict company isolation
DROP POLICY IF EXISTS "Users can view projects from their companies" ON projects;

CREATE POLICY "Users can view projects from their companies" 
ON projects 
FOR SELECT 
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Ensure other operations are also properly restricted
DROP POLICY IF EXISTS "Users can create projects in their companies" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their companies" ON projects;
DROP POLICY IF EXISTS "Users can delete projects in their companies" ON projects;

CREATE POLICY "Users can create projects in their companies" 
ON projects 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can update projects in their companies" 
ON projects 
FOR UPDATE 
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can delete projects in their companies" 
ON projects 
FOR DELETE 
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  )
);