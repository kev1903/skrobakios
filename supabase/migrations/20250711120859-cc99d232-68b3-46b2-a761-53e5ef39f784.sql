-- Remove user management related tables and edge functions
-- Keep only the basic authentication system with superadmin

-- Drop tables related to user invitations and management
DROP TABLE IF EXISTS public.user_invitations CASCADE;
DROP TABLE IF EXISTS public.email_sending_log CASCADE;
DROP TABLE IF EXISTS public.team_invitations CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.member_permissions CASCADE;

-- Update user_roles table to only support superadmin and user
-- First, update all non-superadmin roles to 'user'
UPDATE public.user_roles 
SET role = 'user' 
WHERE role != 'superadmin';

-- Drop the old user_role enum
DROP TYPE IF EXISTS user_role CASCADE;

-- Create new simplified enum
CREATE TYPE user_role AS ENUM ('superadmin', 'user');

-- Recreate user_roles table with simplified schema
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Update profiles table to remove unnecessary fields and simplify
UPDATE public.profiles 
SET status = 'active' 
WHERE status != 'active';

-- Keep only basic profile information
-- Remove the needs_password_reset column as it's not needed in simplified system
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS needs_password_reset;

-- Update RLS policies to be simpler
DROP POLICY IF EXISTS "Superadmin can create invitations" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmin can delete invitations" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmin can update invitations" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmin can view all invitations" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can verify invitations by token" ON public.user_roles;

-- Update handle_user_signup function to be simpler
CREATE OR REPLACE FUNCTION public.handle_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a simple active profile
  INSERT INTO public.profiles (user_id, first_name, last_name, email, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    'active'
  );
  
  -- Assign role: superadmin for kevin@skrobaki.com, user for everyone else
  IF NEW.email = 'kevin@skrobaki.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;