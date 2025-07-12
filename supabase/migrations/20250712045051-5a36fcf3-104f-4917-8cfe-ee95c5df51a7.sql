-- Fix company creation RLS policies

-- First, drop all existing problematic policies for companies table
DROP POLICY IF EXISTS "Anyone authenticated can create companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;

-- Create a simple policy that allows authenticated users to create companies
CREATE POLICY "Authenticated users can create companies" 
ON companies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Ensure other policies remain functional for viewing and updating
-- Drop and recreate the view policy to be more permissive
DROP POLICY IF EXISTS "Users can view their member companies" ON companies;

CREATE POLICY "Users can view their member companies" 
ON companies 
FOR SELECT 
TO authenticated
USING (
  -- Users can see companies they are members of
  public.is_company_member(id, auth.uid()) 
  OR 
  -- Users can see companies they created
  created_by = auth.uid()
  OR
  -- Superadmins can see all companies
  public.has_role(auth.uid(), 'superadmin'::app_role)
);