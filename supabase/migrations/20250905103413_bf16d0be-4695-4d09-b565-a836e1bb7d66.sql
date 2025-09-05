-- Harden projects RLS with SECURITY DEFINER checks to avoid RLS recursion
DO $$
BEGIN
  -- Enable RLS on projects
  EXECUTE 'ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Drop old policies if present to avoid duplicates
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='projects' AND policyname='projects_select_company_members'
  ) THEN
    EXECUTE 'DROP POLICY projects_select_company_members ON public.projects';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='projects' AND policyname='projects_modify_admins'
  ) THEN
    EXECUTE 'DROP POLICY projects_modify_admins ON public.projects';
  END IF;
END $$;

-- Create SELECT policy using SECURITY DEFINER function to avoid recursion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='projects' AND policyname='projects_select_members_secure'
  ) THEN
    EXECUTE $$
      CREATE POLICY projects_select_members_secure
      ON public.projects
      FOR SELECT
      USING (public.is_company_member_secure(company_id, auth.uid()));
    $$;
  END IF;
END $$;

-- Create manage policy for owners/admins using secure function
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='projects' AND policyname='projects_manage_admins_secure'
  ) THEN
    EXECUTE $$
      CREATE POLICY projects_manage_admins_secure
      ON public.projects
      FOR ALL
      USING (public.is_company_admin_or_owner(company_id, auth.uid()))
      WITH CHECK (public.is_company_admin_or_owner(company_id, auth.uid()));
    $$;
  END IF;
END $$;