-- Fix company membership statuses to have at least one active company
-- First, ensure user has an active company (default to Skrobaki main company)
UPDATE company_members 
SET status = 'active', updated_at = NOW()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8'; -- Skrobaki main company