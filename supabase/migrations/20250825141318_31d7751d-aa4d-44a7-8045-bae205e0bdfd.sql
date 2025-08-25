-- Reactivate memberships for the correct companies
UPDATE public.company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id IN (
  '4042458b-8e95-4842-90d9-29f43815ecf8', -- Skrobaki (original)
  'df0df659-7e4c-41c4-a028-495539a0b556'  -- Courtscapes (with 4 projects)
);