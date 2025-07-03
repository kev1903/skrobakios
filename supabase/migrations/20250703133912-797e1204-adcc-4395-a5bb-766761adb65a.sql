-- Expand the user_role enum to include all the role types used in the admin interface
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'project_manager';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'project_admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'consultant';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'subcontractor';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'estimator';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'accounts';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'client_viewer';

-- Update the handle_user_signup function to properly map invited roles
CREATE OR REPLACE FUNCTION public.handle_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  invited_role user_role;
BEGIN
  -- Check if there's an existing invited profile for this email
  UPDATE public.profiles 
  SET user_id = NEW.id, 
      status = 'active',
      updated_at = now()
  WHERE email = NEW.email 
    AND status = 'invited' 
    AND user_id IS NULL;
  
  -- If an invited profile was found, get the invited role
  IF FOUND THEN
    SELECT ui.invited_role INTO invited_role
    FROM public.user_invitations ui
    WHERE ui.email = NEW.email 
      AND ui.used_at IS NULL
    ORDER BY ui.created_at DESC
    LIMIT 1;
    
    -- Create user role with the invited role or default to user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, COALESCE(invited_role, 'user'));
    
    -- Mark invitation as used
    UPDATE public.user_invitations 
    SET used_at = now()
    WHERE email = NEW.email 
      AND used_at IS NULL;
  ELSE
    -- No invited profile found, create a new active profile
    INSERT INTO public.profiles (user_id, first_name, last_name, email, status)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.email,
      'active'
    );
    
    -- Check if this is kevin@skrobaki.com and assign superadmin role
    IF NEW.email = 'kevin@skrobaki.com' THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'superadmin');
    ELSE
      -- Assign regular user role to all other users
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'user');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;