-- Add user as owner of Courtscapes company
INSERT INTO public.company_members (user_id, company_id, role, status)
VALUES ('6951EAA2-1264-4A1A-A86D-817E462202C7', 'df0df659-7e4c-41c4-a028-495539a0b556', 'owner', 'active')
ON CONFLICT (user_id, company_id) 
DO UPDATE SET 
  role = 'owner',
  status = 'active',
  updated_at = now();