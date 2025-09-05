-- Ensure projects SELECT works for company members
DO $$
BEGIN
  -- Enable RLS (idempotent)
  EXECUTE 'ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN
  -- ignore if table missing; will raise otherwise
  NULL;
END $$;

-- Allow authenticated company members to view their company projects
CREATE POLICY IF NOT EXISTS projects_select_company_members
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

-- Allow owners/admins to manage projects (optional but safe)
CREATE POLICY IF NOT EXISTS projects_modify_admins
ON public.projects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner','admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner','admin')
  )
);
