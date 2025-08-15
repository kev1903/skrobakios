-- Activate ALL company memberships for the user
-- This is the root cause - all memberships are inactive which prevents seeing projects

UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND status = 'inactive';