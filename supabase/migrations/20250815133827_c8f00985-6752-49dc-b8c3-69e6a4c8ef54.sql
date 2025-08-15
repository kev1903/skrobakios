-- Fix: First, activate the Skrobaki (main) company that was just activated previously
-- The migration didn't actually activate it in the last run, so let's activate it now
UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
  AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8';

-- Ensure all other companies are inactive to prevent conflicts
UPDATE company_members 
SET status = 'inactive', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
  AND company_id != '4042458b-8e95-4842-90d9-29f43815ecf8';