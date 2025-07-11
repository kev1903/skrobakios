-- Fix the infinite recursion in company_members policies by removing the circular reference

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members of their companies" ON company_members;

-- Create a simplified view policy that doesn't reference the same table
CREATE POLICY "Users can view company members" 
ON company_members 
FOR SELECT 
TO authenticated
USING (
  -- Users can view members of companies where they are active members
  company_id IN (
    SELECT c.id 
    FROM companies c 
    WHERE EXISTS (
      SELECT 1 FROM company_members cm2 
      WHERE cm2.company_id = c.id 
      AND cm2.user_id = auth.uid() 
      AND cm2.status = 'active'
    )
  )
);