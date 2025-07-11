-- Fix the infinite recursion issue in company_members RLS policy
DROP POLICY IF EXISTS "Company admins can manage members" ON company_members;

-- Create the corrected policy
CREATE POLICY "Company admins can manage members" 
ON company_members 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM company_members cm
    WHERE cm.company_id = company_members.company_id 
    AND cm.user_id = auth.uid() 
    AND cm.role = ANY (ARRAY['admin'::text, 'owner'::text]) 
    AND cm.status = 'active'::text
  )
);