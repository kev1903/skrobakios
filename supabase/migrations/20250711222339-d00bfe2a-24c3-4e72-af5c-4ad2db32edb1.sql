-- Complete fix for company update issues

-- Step 1: Drop all existing problematic policies
DROP POLICY IF EXISTS "Company admins can update companies" ON companies;
DROP POLICY IF EXISTS "Users can view companies they are members of" ON companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON companies;

-- Step 2: Create security definer functions to avoid circular dependencies
CREATE OR REPLACE FUNCTION public.is_company_admin_or_owner(target_company_id uuid, target_user_id uuid)
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

CREATE OR REPLACE FUNCTION public.is_company_member(target_company_id uuid, target_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_id = target_company_id
    AND user_id = target_user_id
    AND status = 'active'::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 3: Create new clean RLS policies for companies table
CREATE POLICY "Anyone authenticated can create companies" 
ON companies 
FOR INSERT 
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their member companies" 
ON companies 
FOR SELECT 
TO authenticated
USING (public.is_company_member(id, auth.uid()));

-- Step 4: Create superadmin policy for company updates
CREATE POLICY "Superadmins can update all companies" 
ON companies 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'::app_role));

-- Step 5: Create company admin policy for company updates  
CREATE POLICY "Company admins can update their companies" 
ON companies 
FOR UPDATE 
TO authenticated
USING (public.is_company_admin_or_owner(id, auth.uid()))
WITH CHECK (public.is_company_admin_or_owner(id, auth.uid()));

-- Step 6: Ensure company owners can delete companies
CREATE POLICY "Company owners can delete companies" 
ON companies 
FOR DELETE 
TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'superadmin'::app_role));