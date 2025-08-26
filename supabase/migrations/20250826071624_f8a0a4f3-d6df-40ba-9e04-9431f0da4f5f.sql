-- Add Kevin Enassee as admin of Courtscapes so it appears in his list
-- Safe upsert to company_members
INSERT INTO public.company_members (user_id, company_id, role, status)
VALUES ('5213f4be-54a3-4985-a88e-e460154e52fd'::uuid, 'df0df659-7e4c-41c4-a028-495539a0b556'::uuid, 'admin', 'active')
ON CONFLICT (user_id, company_id)
DO UPDATE SET 
  role = EXCLUDED.role,
  status = 'active',
  updated_at = now();