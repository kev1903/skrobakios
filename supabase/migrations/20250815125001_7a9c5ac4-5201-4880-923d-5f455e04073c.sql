-- Ensure user's company memberships are active
UPDATE company_members 
SET status = 'active', updated_at = NOW()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND status = 'inactive';