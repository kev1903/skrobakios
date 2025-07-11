-- Fix the infinite recursion by simplifying company_members policies

-- Drop the problematic policies and function
DROP POLICY IF EXISTS "Company admins can manage members" ON company_members;
DROP POLICY IF EXISTS "Users can view company members" ON company_members;
DROP FUNCTION IF EXISTS public.check_company_admin_access(uuid);

-- Create simpler policies that don't create recursion
CREATE POLICY "Users can view their own membership" 
ON company_members 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own membership" 
ON company_members 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- For company updates, we'll rely on the companies table policies instead
-- This policy allows company owners to manage members
CREATE POLICY "Company owners can manage members" 
ON company_members 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM companies c 
    WHERE c.id = company_members.company_id 
    AND c.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM companies c 
    WHERE c.id = company_members.company_id 
    AND c.created_by = auth.uid()
  )
);