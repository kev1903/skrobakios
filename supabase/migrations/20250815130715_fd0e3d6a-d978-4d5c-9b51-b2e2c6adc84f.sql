-- Fix all company memberships to be active for the current user
UPDATE company_members 
SET status = 'active' 
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd';

-- Ensure only one company is active at a time (set others to inactive first)
UPDATE company_members 
SET status = 'inactive' 
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'
AND company_id != '4042458b-8e95-4842-90d9-29f43815ecf8';

-- Set the main Skrobaki company as active
UPDATE company_members 
SET status = 'active' 
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'
AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8';