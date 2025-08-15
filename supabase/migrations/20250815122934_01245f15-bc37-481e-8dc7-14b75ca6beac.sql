-- Fix: Activate the main Skrobaki company (the one with most projects) as the current active company
-- This follows the intended business logic of having one active company at a time

UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8';  -- Skrobaki company with 15 projects

-- Ensure all other companies are inactive (this is the intended behavior)
UPDATE company_members 
SET status = 'inactive', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id != '4042458b-8e95-4842-90d9-29f43815ecf8';