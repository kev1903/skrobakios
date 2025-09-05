-- Clean and rebuild projects RLS to fix ambiguous column errors

-- 1) Drop all existing policies on projects
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

-- 3) Recreate minimal, explicit policies
CREATE POLICY projects_select_members_secure_v2
ON public.projects
FOR SELECT
USING (
  public.is_company_member_secure(projects.company_id, auth.uid())
  OR public.is_platform_admin()
);

CREATE POLICY projects_manage_admins_secure_v2
ON public.projects
FOR ALL
USING (
  public.is_company_admin_or_owner(projects.company_id, auth.uid())
  OR public.is_platform_admin()
)
WITH CHECK (
  public.is_company_admin_or_owner(projects.company_id, auth.uid())
  OR public.is_platform_admin()
);