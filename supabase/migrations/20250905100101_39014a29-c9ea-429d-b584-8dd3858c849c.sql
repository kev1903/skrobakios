-- Fix company_members infinite recursion by dropping and recreating function with correct signature

-- 1) Drop the existing function that has different parameter names
DROP FUNCTION IF EXISTS public.is_member_of_company(uuid, uuid);

-- 2) Create the security definer function with correct parameter names
CREATE OR REPLACE FUNCTION public.is_member_of_company(target_company_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = target_company_id 
    AND cm.user_id = target_user_id 
    AND cm.status = 'active'
  );
END;
$$;

-- 3) Drop problematic recursive policies on company_members
DROP POLICY IF EXISTS "Users can view company members in their companies" ON public.company_members;
DROP POLICY IF EXISTS "Company admins can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert themselves as company members" ON public.company_members;

-- 4) Create simple, non-recursive policies for company_members
CREATE POLICY "Users can view their own company memberships"
ON public.company_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Superadmins can manage all company members"
ON public.company_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
);

CREATE POLICY "Users can insert their own company membership"
ON public.company_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 5) Fix projects policies to use the security definer function
DROP POLICY IF EXISTS "Projects: members can view company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can insert company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can update company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can delete company projects" ON public.projects;

CREATE POLICY "Projects: members can view company projects"
ON public.projects FOR SELECT
USING (public.is_member_of_company(company_id, auth.uid()));

CREATE POLICY "Projects: members can insert company projects"
ON public.projects FOR INSERT
WITH CHECK (public.is_member_of_company(company_id, auth.uid()));

CREATE POLICY "Projects: members can update company projects"
ON public.projects FOR UPDATE
USING (public.is_member_of_company(company_id, auth.uid()))
WITH CHECK (public.is_member_of_company(company_id, auth.uid()));

CREATE POLICY "Projects: members can delete company projects"
ON public.projects FOR DELETE
USING (public.is_member_of_company(company_id, auth.uid()));