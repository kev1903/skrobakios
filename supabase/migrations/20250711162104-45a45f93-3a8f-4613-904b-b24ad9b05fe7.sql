-- Fix the infinite recursion issue in company_members RLS policy using security definer function approach

-- First drop the problematic policy
DROP POLICY IF EXISTS "Company admins can manage members" ON company_members;

-- Create a security definer function to check company admin status
CREATE OR REPLACE FUNCTION public.is_company_admin(target_company_id uuid, target_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_id = target_company_id
    AND user_id = target_user_id
    AND role = ANY (ARRAY['admin'::text, 'owner'::text])
    AND status = 'active'::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create the corrected policy using the security definer function
CREATE POLICY "Company admins can manage members" 
ON company_members 
FOR ALL 
TO authenticated
USING (public.is_company_admin(company_id, auth.uid()));