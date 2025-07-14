-- Delete all company member role assignments (company roles)
DELETE FROM public.company_members;

-- Delete specific users: Smyrna Enasse and David Labrooy
-- First, get their user IDs from profiles
WITH users_to_delete AS (
  SELECT user_id 
  FROM public.profiles 
  WHERE (first_name = 'Smyrna' AND last_name = 'Enasse') 
     OR (first_name = 'David' AND last_name = 'Labrooy')
)
-- Delete from user_roles first (to avoid foreign key issues)
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT user_id FROM users_to_delete);

-- Delete from profiles
WITH users_to_delete AS (
  SELECT user_id 
  FROM public.profiles 
  WHERE (first_name = 'Smyrna' AND last_name = 'Enasse') 
     OR (first_name = 'David' AND last_name = 'Labrooy')
)
DELETE FROM public.profiles 
WHERE user_id IN (SELECT user_id FROM users_to_delete);

-- Clean up any remaining references in other tables for these users
WITH users_to_delete AS (
  SELECT 'Smyrna Enasse' AS full_name
  UNION ALL
  SELECT 'David Labrooy' AS full_name
)
-- Update any other tables that might reference these users by name
UPDATE public.notifications 
SET user_id = NULL 
WHERE user_id IN (
  SELECT p.user_id 
  FROM public.profiles p 
  JOIN users_to_delete u ON CONCAT(p.first_name, ' ', p.last_name) = u.full_name
);

-- Display summary of what was deleted
SELECT 
  'Company roles deleted: All company member assignments removed' as summary
UNION ALL
SELECT 
  'Users deleted: Smyrna Enasse and David Labrooy (if they existed)' as summary;