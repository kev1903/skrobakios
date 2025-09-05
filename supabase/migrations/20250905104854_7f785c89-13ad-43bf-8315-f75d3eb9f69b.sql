-- Resolve 400 ambiguous column errors by rewriting projects RLS policies
-- Use fully-qualified column references (projects.company_id)
-- and remove legacy/duplicate policies to avoid conflicting expressions.

DO $$
DECLARE r record;
BEGIN
  -- Drop all existing policies on public.projects to avoid conflicts
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'projects'
  ) LOOP
    EXECUTE format('DROP POLICY %I ON public.projects', r.policyname);
  END LOOP;

  -- Ensure RLS is enabled
  BEGIN
    EXECUTE 'ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Minimal, safe policies with explicit qualification
  EXECUTE $$
    CREATE POLICY projects_select_members_secure_v2
    ON public.projects
    FOR SELECT
    USING (
      public.is_company_member_secure(projects.company_id, auth.uid())
      OR public.is_platform_admin()
    )
  $$;

  EXECUTE $$
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
    )
  $$;
END $$;