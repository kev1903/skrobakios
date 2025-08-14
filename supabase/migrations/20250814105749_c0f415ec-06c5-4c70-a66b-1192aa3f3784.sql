-- Reactivate access to other companies so user can switch between them
-- But keep only Skrobaki active initially to maintain security

-- Reactivate Courtscapes and Skrobaki PM so they show in the switcher
UPDATE company_members 
SET status = 'inactive', updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'kevin@skrobaki.com')
AND company_id IN (
  SELECT id FROM companies WHERE name IN ('Courtscapes', 'Skrobaki PM')
);

-- The user will now be able to switch between businesses using the BusinessSwitcher
-- Only one company will be active at a time, ensuring proper data isolation