-- Fix company membership status to ensure user has active membership
UPDATE company_members 
SET status = 'active' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
  LIMIT 1
) 
AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8';