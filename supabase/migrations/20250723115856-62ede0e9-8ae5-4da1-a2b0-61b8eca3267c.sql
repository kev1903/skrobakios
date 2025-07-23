-- Fix missing superadmin role for kevin@skrobaki.com
-- This ensures the designated superadmin user has the correct role

-- First, ensure the user has a superadmin role (this should have been created by the signup trigger)
INSERT INTO public.user_roles (user_id, role)
SELECT '5213f4be-54a3-4985-a88e-e460154e52fd', 'superadmin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
  AND role = 'superadmin'
);

-- Also ensure the user has a profile record
INSERT INTO public.profiles (user_id, email, first_name, last_name, status)
SELECT '5213f4be-54a3-4985-a88e-e460154e52fd', 'kevin@skrobaki.com', 'Kevin', 'Skrobaki', 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'
);

-- Update the profile if it exists but is missing the email
UPDATE public.profiles 
SET email = 'kevin@skrobaki.com', 
    first_name = COALESCE(first_name, 'Kevin'),
    last_name = COALESCE(last_name, 'Skrobaki'),
    status = 'active',
    updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd';