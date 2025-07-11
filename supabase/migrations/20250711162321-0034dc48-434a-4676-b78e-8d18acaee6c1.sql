-- Comprehensive fix for the company_members infinite recursion issue

-- Drop ALL policies on company_members table to start fresh
DROP POLICY IF EXISTS "Company admins can manage members" ON company_members;
DROP POLICY IF EXISTS "Users can view members of their companies" ON company_members;

-- Drop the function if it exists and recreate it
DROP FUNCTION IF EXISTS public.is_company_admin(uuid, uuid);

-- Create the security definer function with a different approach
CREATE OR REPLACE FUNCTION public.check_company_admin_access(target_company_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- If no user is authenticated, return false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the current user is an admin or owner of the target company
  RETURN EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_id = target_company_id
    AND user_id = current_user_id
    AND role = ANY (ARRAY['admin'::text, 'owner'::text])
    AND status = 'active'::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies with simpler logic
CREATE POLICY "Users can view members of their companies" 
ON company_members 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_members cm 
    WHERE cm.company_id = company_members.company_id 
    AND cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Company admins can manage members" 
ON company_members 
FOR ALL 
TO authenticated
USING (public.check_company_admin_access(company_id))
WITH CHECK (public.check_company_admin_access(company_id));