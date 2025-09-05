-- Drop all existing policies on user_roles safely - FIXED
DROP POLICY IF EXISTS users_view_own_roles ON public.user_roles;
DROP POLICY IF EXISTS service_role_manage_user_roles ON public.user_roles;

-- Create simple RLS policies for user_roles that don't reference user_roles table
CREATE POLICY users_view_own_roles
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY service_role_manage_user_roles
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create test projects for each company to validate filtering works
INSERT INTO public.projects (
  project_id, name, description, company_id, status, location, latitude, longitude
) VALUES 
('CS-001','Courtscapes Test Project','Test project for Courtscapes company','df0df659-7e4c-41c4-a028-495539a0b556'::uuid,'active','Melbourne VIC, Australia',-37.8136,144.9631),
('SK-001','Skrobaki Test Project','Test project for Skrobaki company','4042458b-8e95-4842-90d9-29f43815ecf8'::uuid,'active','Melbourne VIC, Australia',-37.8136,144.9631),
('SKPM-001','Skrobaki PM Test Project','Test project for Skrobaki PM company','31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'::uuid,'active','Melbourne VIC, Australia',-37.8136,144.9631)
ON CONFLICT (project_id) DO NOTHING;