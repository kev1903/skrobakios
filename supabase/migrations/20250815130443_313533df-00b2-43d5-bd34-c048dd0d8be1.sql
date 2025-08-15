-- Create missing company membership for the user
-- First, let's get the current user and create the membership if it doesn't exist
INSERT INTO company_members (user_id, company_id, role, status)
SELECT 
  u.id as user_id,
  '4042458b-8e95-4842-90d9-29f43815ecf8' as company_id,
  'admin' as role,
  'active' as status
FROM auth.users u
WHERE u.id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM company_members cm 
    WHERE cm.user_id = u.id 
    AND cm.company_id = '4042458b-8e95-4842-90d9-29f43815ecf8'
  );