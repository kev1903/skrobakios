-- Fix infinite recursion in company_members policies

-- 1) Create security definer function to avoid circular references
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

-- 2) Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view company members in their companies" ON public.company_members;
DROP POLICY IF EXISTS "Company admins can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert themselves as company members" ON public.company_members;

-- 3) Create corrected policies using superadmin check for admin operations
CREATE POLICY "Users can view their company memberships"
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

-- 4) Fix projects policies to use the security definer function
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