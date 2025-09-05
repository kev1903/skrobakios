-- Fix infinite recursion in company_members by recreating function and fixing all dependent policies

-- 1) Drop the existing function with CASCADE to remove all dependencies
DROP FUNCTION IF EXISTS public.is_member_of_company(uuid, uuid) CASCADE;

-- 2) Recreate the function with proper signature and search path
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

-- 3) Drop and recreate company_members policies (non-recursive)
DROP POLICY IF EXISTS "Users can view company members in their companies" ON public.company_members;
DROP POLICY IF EXISTS "Company admins can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert themselves as company members" ON public.company_members;
DROP POLICY IF EXISTS "Users can view their company memberships" ON public.company_members;
DROP POLICY IF EXISTS "Superadmins can manage all company members" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert their own company membership" ON public.company_members;

-- Simple policies that don't reference company_members table in their conditions
CREATE POLICY "Users can view their own membership records"
ON public.company_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Superadmins can manage company members"
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

CREATE POLICY "Users can add themselves to companies"
ON public.company_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 4) Recreate projects policies using the new function
CREATE POLICY "Projects: company members can view"
ON public.projects FOR SELECT
USING (public.is_member_of_company(company_id, auth.uid()));

CREATE POLICY "Projects: company members can insert"
ON public.projects FOR INSERT
WITH CHECK (public.is_member_of_company(company_id, auth.uid()));

CREATE POLICY "Projects: company members can update"
ON public.projects FOR UPDATE
USING (public.is_member_of_company(company_id, auth.uid()))
WITH CHECK (public.is_member_of_company(company_id, auth.uid()));

CREATE POLICY "Projects: company members can delete"
ON public.projects FOR DELETE
USING (public.is_member_of_company(company_id, auth.uid()));

-- 5) Recreate project_documents policies that were dropped with CASCADE
CREATE POLICY "Users can view project documents they have access to"
ON public.project_documents FOR SELECT
USING (
  ((project_id IS NOT NULL) AND public.is_member_of_company((SELECT company_id FROM projects WHERE id = project_documents.project_id), auth.uid())) 
  OR 
  ((estimate_id IS NOT NULL) AND (EXISTS (SELECT 1 FROM estimates e WHERE e.id = project_documents.estimate_id AND public.is_member_of_company(e.company_id, auth.uid()))))
);

CREATE POLICY "Users can insert project documents they have access to"
ON public.project_documents FOR INSERT
WITH CHECK (
  ((project_id IS NOT NULL) AND public.is_member_of_company((SELECT company_id FROM projects WHERE id = project_documents.project_id), auth.uid())) 
  OR 
  ((estimate_id IS NOT NULL) AND (EXISTS (SELECT 1 FROM estimates e WHERE e.id = project_documents.estimate_id AND public.is_member_of_company(e.company_id, auth.uid()))))
);

CREATE POLICY "Users can update project documents they have access to"
ON public.project_documents FOR UPDATE
USING (
  ((project_id IS NOT NULL) AND public.is_member_of_company((SELECT company_id FROM projects WHERE id = project_documents.project_id), auth.uid())) 
  OR 
  ((estimate_id IS NOT NULL) AND (EXISTS (SELECT 1 FROM estimates e WHERE e.id = project_documents.estimate_id AND public.is_member_of_company(e.company_id, auth.uid()))))
);