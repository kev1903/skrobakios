-- Fix the inactive company membership for Skrobaki PM
UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id = '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5';