-- First, let's delete all non-superadmin users and their related data
-- Keep only Kevin (superadmin) with email kevin@skrobaki.com

-- Delete company memberships for non-superadmin users
DELETE FROM company_members 
WHERE user_id IN (
    SELECT p.user_id 
    FROM profiles p
    LEFT JOIN user_roles ur ON p.user_id = ur.user_id
    WHERE p.email != 'kevin@skrobaki.com'
    OR ur.role != 'superadmin'
    OR ur.role IS NULL
);

-- Delete user roles for non-superadmin users  
DELETE FROM user_roles
WHERE user_id IN (
    SELECT user_id FROM profiles 
    WHERE email != 'kevin@skrobaki.com'
)
AND role != 'superadmin';

-- Delete profiles for non-superadmin users
DELETE FROM profiles 
WHERE email != 'kevin@skrobaki.com';

-- Clean up any orphaned companies (those without any members)
DELETE FROM companies 
WHERE id NOT IN (
    SELECT DISTINCT company_id 
    FROM company_members
);

-- Verify Kevin is still there
SELECT 
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.email = 'kevin@skrobaki.com';