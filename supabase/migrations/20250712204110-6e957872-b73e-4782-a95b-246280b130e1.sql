-- Drop the problematic policy
DROP POLICY IF EXISTS "Platform admins and company members can view companies" ON public.companies;

-- Create a security definer function to check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('superadmin', 'platform_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a new policy using the security definer function
CREATE POLICY "Platform admins and company members can view companies" 
ON public.companies 
FOR SELECT 
USING (
  -- Platform admins can see all companies
  public.is_platform_admin()
  OR
  -- Regular users can see companies they are members of
  id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);