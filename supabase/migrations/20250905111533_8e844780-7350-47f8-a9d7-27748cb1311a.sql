-- Rebuild projects RLS avoiding any function calls and fully qualifying columns

-- 1) Drop existing policies on projects
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'projects'
  ) LOOP
    EXECUTE format('DROP POLICY %I ON public.projects', r.policyname);
  END LOOP;
END $$;

-- 2) Ensure RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 3) Create explicit policies with qualified columns only
CREATE POLICY projects_select_members_secure_v3
ON public.projects
FOR SELECT
USING (
  public.is_platform_admin() OR EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY projects_manage_admins_secure_v3
ON public.projects
FOR ALL
USING (
  public.is_platform_admin() OR EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner','admin')
  )
)
WITH CHECK (
  public.is_platform_admin() OR EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = projects.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner','admin')
  )
);
