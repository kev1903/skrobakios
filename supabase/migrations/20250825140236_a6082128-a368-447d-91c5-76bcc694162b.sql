-- Remove superadmin membership from duplicate companies to clean up the business list
UPDATE public.company_members 
SET status = 'inactive', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id IN (
  '27c87aa8-2c15-4f03-9712-04e849865ce7', -- Courtscapes duplicate (newer, less data)
  '15605d62-d9fd-423b-b9f5-a64d4ff0f000', -- Skrobaki PM duplicate 1
  '8ce7c76d-b878-4f07-ae96-50fa6b9a1768'  -- Skrobaki PM duplicate 2
);