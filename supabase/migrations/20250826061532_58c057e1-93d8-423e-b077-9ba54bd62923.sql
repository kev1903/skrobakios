-- Add Dav Labrooy (info@courtscapes.com.au) as owner of the main Courtscapes company
INSERT INTO public.company_members (user_id, company_id, role, status)
VALUES ('84062198-980c-46bc-86c3-5ca78d8a546d'::uuid, 'df0df659-7e4c-41c4-a028-495539a0b556'::uuid, 'owner', 'active')
ON CONFLICT (user_id, company_id) 
DO UPDATE SET 
  role = 'owner',
  status = 'active',
  updated_at = now();