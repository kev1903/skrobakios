-- Fix the company membership status - set the current company to active
UPDATE company_members 
SET 
  status = 'active',
  updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'
  AND company_id = '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5';

-- Also ensure we can switch to the other company
UPDATE company_members 
SET 
  status = 'active',
  updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'
  AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8';