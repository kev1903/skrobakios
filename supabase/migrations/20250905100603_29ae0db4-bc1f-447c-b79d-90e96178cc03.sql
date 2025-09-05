-- Insert test data with required project_id field

-- Ensure the user has company membership
INSERT INTO public.company_members (company_id, user_id, role, status)
SELECT 
  '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'::uuid as company_id,
  '5213f4be-54a3-4985-a88e-e460154e52fd'::uuid as user_id,
  'owner' as role,
  'active' as status
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_members 
  WHERE company_id = '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'::uuid 
  AND user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'::uuid
);

-- Create a test project with all required fields
INSERT INTO public.projects (
  project_id,
  name, 
  description, 
  company_id, 
  status,
  location,
  latitude,
  longitude
) 
SELECT 
  'PROJ-2025-001' as project_id,
  'Test Construction Project' as name,
  'A sample project to verify the system is working' as description,
  '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'::uuid as company_id,
  'active' as status,
  'Melbourne VIC, Australia' as location,
  -37.8136 as latitude,
  144.9631 as longitude
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects 
  WHERE company_id = '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'::uuid
);