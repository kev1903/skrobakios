-- Drop ALL existing policies first and recreate from scratch

-- 1) Drop ALL company_members policies
DROP POLICY IF EXISTS "Users can view their own company memberships" ON public.company_members;
DROP POLICY IF EXISTS "Superadmins can manage all company members" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert their own company membership" ON public.company_members;

-- 2) Drop ALL projects policies  
DROP POLICY IF EXISTS "Projects: members can view company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can insert company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can update company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can delete company projects" ON public.projects;

-- 3) Create simple, non-recursive policies for company_members
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

-- 4) Recreate projects policies using the corrected function
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