-- Fix infinite recursion in RLS by simplifying policies on company_members and profiles
-- and ensuring they do not self-reference or depend on recursive subqueries.

-- 1) Ensure RLS is enabled and drop any problematic/old policies
DO $$
DECLARE r record;
BEGIN
  -- Enable RLS (ignore if already enabled)
  BEGIN
    EXECUTE 'ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Drop ALL existing policies on company_members
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='company_members'
  ) LOOP
    EXECUTE format('DROP POLICY %I ON public.company_members', r.policyname);
  END LOOP;

  -- Drop ALL existing policies on profiles
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='profiles'
  ) LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', r.policyname);
  END LOOP;
END $$;

-- 2) Minimal, safe, non-recursive policies
-- company_members: users can see ONLY their own memberships
CREATE POLICY company_members_select_self
ON public.company_members
FOR SELECT
USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE from clients by default; keep tight until needed explicitly

-- profiles: users can see and manage ONLY their own profile rows
CREATE POLICY profiles_select_self
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY profiles_insert_self
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_update_self
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3) OPTIONAL: keep helper functions stable and secure if already created by earlier migrations
-- (No-op here to avoid duplication). If they don't exist yet, you can uncomment and run once.
-- CREATE OR REPLACE FUNCTION public.is_company_member_secure(_company_id uuid, _user_id uuid)
-- RETURNS boolean AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM public.company_members
--     WHERE company_id = _company_id AND user_id = _user_id AND status = 'active'
--   );
-- $$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- CREATE OR REPLACE FUNCTION public.is_company_admin_or_owner(_company_id uuid, _user_id uuid)
-- RETURNS boolean AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM public.company_members
--     WHERE company_id = _company_id AND user_id = _user_id
--       AND (role IN ('owner','admin','business_admin','project_admin'))
--       AND status = 'active'
--   );
-- $$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;
