-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view companies they are members of" ON public.companies;

-- Create a comprehensive policy for viewing companies
CREATE POLICY "Platform admins and company members can view companies" 
ON public.companies 
FOR SELECT 
USING (
  -- Platform admins can see all companies
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('superadmin', 'platform_admin')
  )
  OR
  -- Regular users can see companies they are members of
  id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);