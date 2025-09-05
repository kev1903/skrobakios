-- Fix infinite recursion by dropping function with CASCADE and recreating all policies

-- 1) Drop the function with CASCADE to remove all dependent policies
DROP FUNCTION IF EXISTS public.is_member_of_company(uuid, uuid) CASCADE;

-- 2) Create the corrected security definer function
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

-- 5) Recreate project_documents policies that were dropped with CASCADE
CREATE POLICY "Users can view project documents they have access to"
ON public.project_documents FOR SELECT
USING (
  ((project_id IS NOT NULL) AND public.is_member_of_company((SELECT company_id FROM projects WHERE id = project_documents.project_id), auth.uid()))
  OR 
  ((estimate_id IS NOT NULL) AND (EXISTS (
    SELECT 1 FROM estimates e
    WHERE e.id = project_documents.estimate_id 
    AND public.is_member_of_company(e.company_id, auth.uid())
  )))
);

CREATE POLICY "Users can insert project documents they have access to"
ON public.project_documents FOR INSERT
WITH CHECK (
  ((project_id IS NOT NULL) AND public.is_member_of_company((SELECT company_id FROM projects WHERE id = project_documents.project_id), auth.uid()))
  OR 
  ((estimate_id IS NOT NULL) AND (EXISTS (
    SELECT 1 FROM estimates e
    WHERE e.id = project_documents.estimate_id 
    AND public.is_member_of_company(e.company_id, auth.uid())
  )))
);

CREATE POLICY "Users can update project documents they have access to"
ON public.project_documents FOR UPDATE
USING (
  ((project_id IS NOT NULL) AND public.is_member_of_company((SELECT company_id FROM projects WHERE id = project_documents.project_id), auth.uid()))
  OR 
  ((estimate_id IS NOT NULL) AND (EXISTS (
    SELECT 1 FROM estimates e
    WHERE e.id = project_documents.estimate_id 
    AND public.is_member_of_company(e.company_id, auth.uid())
  )))
);