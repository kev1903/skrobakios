-- Activate Courtscapes and Skrobaki PM company memberships for superadmin
UPDATE public.company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id IN (
  '27c87aa8-2c15-4f03-9712-04e849865ce7', -- Courtscapes
  'df0df659-7e4c-41c4-a028-495539a0b556', -- Courtscapes (duplicate)
  '15605d62-d9fd-423b-b9f5-a64d4ff0f000', -- Skrobaki PM
  '8ce7c76d-b878-4f07-ae96-50fa6b9a1768', -- Skrobaki PM
  '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5'  -- Skrobaki PM
);