-- Fix infinite recursion by creating security definer functions for both tables

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Platform admins and company members can view companies" ON public.companies;
DROP POLICY IF EXISTS "Company owners can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.company_members;

-- Create security definer function to check company membership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_company_member_secure(company_id uuid, user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members cm 
    WHERE cm.company_id = company_id 
    AND cm.user_id = user_id 
    AND cm.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create security definer function to check if user can manage company
CREATE OR REPLACE FUNCTION public.can_manage_company(company_id uuid, user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM companies c 
    WHERE c.id = company_id 
    AND c.created_by = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new companies policy using security definer functions
CREATE POLICY "Platform admins and company members can view companies" 
ON public.companies 
FOR SELECT 
USING (
  -- Platform admins can see all companies
  public.is_platform_admin()
  OR
  -- Regular users can see companies they are members of
  public.is_company_member_secure(id, auth.uid())
);

-- Create new company_members policies using security definer functions
CREATE POLICY "Company owners can manage members" 
ON public.company_members 
FOR ALL 
USING (public.can_manage_company(company_id, auth.uid()))
WITH CHECK (public.can_manage_company(company_id, auth.uid()));

CREATE POLICY "Users can view their own membership" 
ON public.company_members 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own membership" 
ON public.company_members 
FOR INSERT 
WITH CHECK (user_id = auth.uid());