-- Fix missing company for kevin@skrobaki.com
-- Create a company and associate the user with it

-- Create a company for the user
INSERT INTO public.companies (id, name, slug, created_by, business_type, public_page, verified)
VALUES (
  '4042458b-8e95-4842-90d9-29f43815ecf8',
  'Skrobaki Construction',
  'skrobaki-construction',
  '5213f4be-54a3-4985-a88e-e460154e52fd',
  'company',
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  created_by = EXCLUDED.created_by,
  updated_at = now();

-- Add the user as an owner of the company
INSERT INTO public.company_members (company_id, user_id, role, status, joined_at)
VALUES (
  '4042458b-8e95-4842-90d9-29f43815ecf8',
  '5213f4be-54a3-4985-a88e-e460154e52fd',
  'owner',
  'active',
  now()
)
ON CONFLICT (company_id, user_id) DO UPDATE SET
  role = 'owner',
  status = 'active',
  updated_at = now();

-- Initialize company modules
INSERT INTO public.company_modules (company_id, module_name, enabled)
VALUES 
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'projects', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'finance', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'sales', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'dashboard', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'digital-twin', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'cost-contracts', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'tasks', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'files', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'team', true),
  ('4042458b-8e95-4842-90d9-29f43815ecf8', 'digital-objects', true)
ON CONFLICT (company_id, module_name) DO UPDATE SET
  enabled = EXCLUDED.enabled;