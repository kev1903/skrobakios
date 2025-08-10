-- Create safe helper without conflicting param names
CREATE OR REPLACE FUNCTION public.is_member_of_company(
  p_company_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = p_company_id
      AND cm.user_id = p_user_id
      AND cm.status = 'active'
  );
$$;

-- Recreate project_documents policies to use the safe helper
DROP POLICY IF EXISTS "Users can insert project documents they have access to" ON public.project_documents;
DROP POLICY IF EXISTS "Users can update project documents they have access to" ON public.project_documents;
DROP POLICY IF EXISTS "Users can view project documents they have access to" ON public.project_documents;

CREATE POLICY "Users can insert project documents they have access to"
ON public.project_documents
FOR INSERT
TO authenticated
WITH CHECK (
  (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
  OR
  (estimate_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_id
      AND public.is_member_of_company(e.company_id, auth.uid())
  ))
);

CREATE POLICY "Users can update project documents they have access to"
ON public.project_documents
FOR UPDATE
TO authenticated
USING (
  (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
  OR
  (estimate_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_id
      AND public.is_member_of_company(e.company_id, auth.uid())
  ))
);

CREATE POLICY "Users can view project documents they have access to"
ON public.project_documents
FOR SELECT
TO authenticated
USING (
  (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
  OR
  (estimate_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.estimates e
    WHERE e.id = estimate_id
      AND public.is_member_of_company(e.company_id, auth.uid())
  ))
);
