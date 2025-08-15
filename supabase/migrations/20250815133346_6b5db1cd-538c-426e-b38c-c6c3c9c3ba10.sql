-- Activate the Skrobaki Profile company (the one without "PM")
UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
  AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8';