
-- Create a helper function to check if user can access a project
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_id_param
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  );
$$;

-- Drop all existing RLS policies on invoices
DROP POLICY IF EXISTS "Users can view invoices for their company projects" ON public.invoices;
DROP POLICY IF EXISTS "Users can create invoices for their company projects" ON public.invoices;
DROP POLICY IF EXISTS "Users can update invoices for their company projects" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete invoices for their company projects" ON public.invoices;

-- Create new RLS policies using the helper function
CREATE POLICY "Users can view invoices for their company projects"
ON public.invoices
FOR SELECT
USING (public.user_can_access_project(project_id));

CREATE POLICY "Users can create invoices for their company projects"
ON public.invoices
FOR INSERT
WITH CHECK (public.user_can_access_project(project_id));

CREATE POLICY "Users can update invoices for their company projects"
ON public.invoices
FOR UPDATE
USING (public.user_can_access_project(project_id));

CREATE POLICY "Users can delete invoices for their company projects"
ON public.invoices
FOR DELETE
USING (public.user_can_access_project(project_id));

-- Grant execute on the helper function
GRANT EXECUTE ON FUNCTION public.user_can_access_project(uuid) TO authenticated;
