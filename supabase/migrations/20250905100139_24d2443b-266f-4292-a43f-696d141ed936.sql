-- Fix infinite recursion in company_members RLS policies

-- Create a security definer function to check company membership
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.is_user_member_of_company(target_user_id uuid, target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.company_members cm
    WHERE cm.user_id = target_user_id 
    AND cm.company_id = target_company_id 
    AND cm.status = 'active'
  );
END;
$$;

-- Create another function to get user's company IDs
CREATE OR REPLACE FUNCTION public.get_user_company_ids(target_user_id uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ARRAY(
    SELECT cm.company_id 
    FROM public.company_members cm
    WHERE cm.user_id = target_user_id 
    AND cm.status = 'active'
  );
END;
$$;

-- Drop all existing company_members policies to prevent recursion
DROP POLICY IF EXISTS "Users can view company members in their companies" ON public.company_members;
DROP POLICY IF EXISTS "Company admins can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert themselves as company members" ON public.company_members;

-- Create new non-recursive policies for company_members
-- Allow users to view their own membership records
CREATE POLICY "Users can view their own company memberships"
ON public.company_members FOR SELECT
USING (user_id = auth.uid());

-- Allow users to view other members in the same companies (using security definer function)
CREATE POLICY "Users can view company members in shared companies"
ON public.company_members FOR SELECT
USING (
  company_id = ANY(public.get_user_company_ids(auth.uid()))
);

-- Allow company admins to manage members
CREATE POLICY "Company admins can manage all members"
ON public.company_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
    AND cm.company_id = company_members.company_id
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
    AND cm.company_id = company_members.company_id
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
);

-- Allow users to insert themselves as company members
CREATE POLICY "Users can insert themselves as company members"
ON public.company_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Update projects policies to use the security definer function
DROP POLICY IF EXISTS "Projects: members can view company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can insert company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can update company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can delete company projects" ON public.projects;

CREATE POLICY "Projects: members can view company projects"
ON public.projects FOR SELECT
USING (company_id = ANY(public.get_user_company_ids(auth.uid())));

CREATE POLICY "Projects: members can insert company projects"
ON public.projects FOR INSERT
WITH CHECK (company_id = ANY(public.get_user_company_ids(auth.uid())));

CREATE POLICY "Projects: members can update company projects"
ON public.projects FOR UPDATE
USING (company_id = ANY(public.get_user_company_ids(auth.uid())))
WITH CHECK (company_id = ANY(public.get_user_company_ids(auth.uid())));

CREATE POLICY "Projects: members can delete company projects"
ON public.projects FOR DELETE
USING (company_id = ANY(public.get_user_company_ids(auth.uid())));