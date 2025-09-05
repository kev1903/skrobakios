-- Fully reset user_roles RLS to avoid recursive policy evaluation (42P17)
DO $$
DECLARE pol record;
BEGIN
  -- Ensure table exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    RAISE EXCEPTION 'Table public.user_roles not found';
  END IF;

  -- Drop ALL existing policies on user_roles
  FOR pol IN (
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;

  -- Re-enable RLS (idempotent)
  EXECUTE 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY';
END $$;

-- Minimal, NON-RECURSIVE policies:
-- 1) Allow any authenticated user to SELECT (so SECURITY DEFINER funcs like has_role_secure can read roles for any user without recursion)
CREATE POLICY user_roles_select_authenticated
ON public.user_roles
FOR SELECT
USING (auth.role() = 'authenticated');

-- 2) Only service_role can INSERT/UPDATE/DELETE
CREATE POLICY user_roles_manage_service_role
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
