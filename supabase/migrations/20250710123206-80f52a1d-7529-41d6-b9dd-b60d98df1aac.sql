-- First, check if any users have these roles that we're about to delete
-- and update them to a safe default role
UPDATE public.user_roles 
SET role = 'client_viewer' 
WHERE role IN ('project_admin', 'estimator', 'admin', 'user');

-- Also update any pending invitations with these roles
UPDATE public.user_invitations 
SET invited_role = 'client_viewer' 
WHERE invited_role IN ('project_admin', 'estimator', 'admin', 'user');

-- Remove the default value from user_roles table temporarily
ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;

-- Remove the default value from user_invitations table temporarily  
ALTER TABLE public.user_invitations ALTER COLUMN invited_role DROP DEFAULT;

-- Create the new enum without the unwanted roles
CREATE TYPE public.user_role_new AS ENUM (
  'superadmin',
  'project_manager', 
  'consultant',
  'subcontractor',
  'accounts',
  'client_viewer'
);

-- Update the user_roles table to use the new enum
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE public.user_role_new 
USING role::text::public.user_role_new;

-- Update the user_invitations table to use the new enum  
ALTER TABLE public.user_invitations
ALTER COLUMN invited_role TYPE public.user_role_new
USING invited_role::text::public.user_role_new;

-- Drop the old enum and rename the new one
DROP TYPE public.user_role;
ALTER TYPE public.user_role_new RENAME TO user_role;

-- Restore the default values with the new enum
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'client_viewer'::user_role;
ALTER TABLE public.user_invitations ALTER COLUMN invited_role SET DEFAULT 'client_viewer'::user_role;