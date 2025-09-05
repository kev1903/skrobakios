-- Fix infinite recursion by resetting user_roles policies to non-recursive ones
DO $$
BEGIN
  -- Drop all existing policies on user_roles safely
  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles';
  IF FOUND THEN
    FOR r IN (
      SELECT polname 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'user_roles'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', r.polname);
    END LOOP;

    -- Ensure RLS is enabled (disable and re-enable to clear any FORCE)
    EXECUTE 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Create minimal, non-recursive policies on user_roles
CREATE POLICY users_view_own_roles
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY service_role_manage_user_roles
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Seed test projects for each active company to validate visibility per business
-- Courtscapes
INSERT INTO public.projects (
  project_id, name, description, company_id, status, location, latitude, longitude
) VALUES (
  'CS-TEST-001',
  'Courtscapes Sample Project',
  'Seed project to verify visibility under Courtscapes',
  'df0df659-7e4c-41c4-a028-495539a0b556'::uuid,
  'active',
  'Melbourne VIC, Australia',
  -37.8136,
  144.9631
)
ON CONFLICT (project_id) DO NOTHING;

-- Skrobaki (main)
INSERT INTO public.projects (
  project_id, name, description, company_id, status, location, latitude, longitude
) VALUES (
  'SK-TEST-001',
  'Skrobaki Sample Project',
  'Seed project to verify visibility under Skrobaki',
  '4042458b-8e95-4842-90d9-29f43815ecf8'::uuid,
  'active',
  'Melbourne VIC, Australia',
  -37.8136,
  144.9631
)
ON CONFLICT (project_id) DO NOTHING;

-- Skrobaki PM (already added previously, add fallback)
INSERT INTO public.projects (
  project_id, name, description, company_id, status, location, latitude, longitude
) VALUES (
  'SKPM-TEST-001',
  'Skrobaki PM Sample Project',
  'Seed project to verify visibility under Skrobaki PM',
  '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'::uuid,
  'active',
  'Melbourne VIC, Australia',
  -37.8136,
  144.9631
)
ON CONFLICT (project_id) DO NOTHING;