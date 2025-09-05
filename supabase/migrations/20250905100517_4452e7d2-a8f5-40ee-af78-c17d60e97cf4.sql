-- Insert test data so the user can see projects

-- Get the current user from auth context and ensure they have company membership
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

-- Create a test project for the user to see
INSERT INTO public.projects (
  name, 
  description, 
  company_id, 
  status,
  location,
  latitude,
  longitude
) 
VALUES (
  'Test Construction Project',
  'A sample project to verify the system is working',
  '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'::uuid,
  'active',
  'Melbourne VIC, Australia',
  -37.8136,
  144.9631
)
ON CONFLICT DO NOTHING;