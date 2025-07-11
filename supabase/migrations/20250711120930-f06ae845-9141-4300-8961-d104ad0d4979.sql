-- Remove user management related tables
-- Keep only the basic authentication system with superadmin

-- Drop tables related to user invitations and management
DROP TABLE IF EXISTS public.user_invitations CASCADE;
DROP TABLE IF EXISTS public.email_sending_log CASCADE;
DROP TABLE IF EXISTS public.team_invitations CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.member_permissions CASCADE;

-- First check what roles exist and update them
UPDATE public.user_roles 
SET role = 'user'::user_role
WHERE role != 'superadmin'::user_role;

-- Remove the needs_password_reset column from profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS needs_password_reset;

-- Update profiles to make all users active
UPDATE public.profiles 
SET status = 'active' 
WHERE status != 'active';

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
    VALUES (NEW.id, 'superadmin'::user_role);
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::user_role);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;