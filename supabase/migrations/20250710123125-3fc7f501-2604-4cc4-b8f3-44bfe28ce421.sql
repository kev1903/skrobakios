-- First, check if any users have these roles that we're about to delete
-- and update them to a safe default role
UPDATE public.user_roles 
SET role = 'client_viewer' 
WHERE role IN ('project_admin', 'estimator', 'admin', 'user');

-- Remove the roles from the user_role enum
-- We need to recreate the enum without the unwanted values
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

-- Update any functions that reference the old roles
CREATE OR REPLACE FUNCTION public.has_role_or_higher(required_role user_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT CASE 
    -- Lowest privilege: client_viewer
    WHEN required_role = 'client_viewer' THEN 
      get_current_user_role() IN ('client_viewer', 'accounts', 'subcontractor', 'consultant', 'project_manager', 'superadmin')
    
    -- Financial role: accounts  
    WHEN required_role = 'accounts' THEN 
      get_current_user_role() IN ('accounts', 'subcontractor', 'consultant', 'project_manager', 'superadmin')
    
    -- External contractor: subcontractor
    WHEN required_role = 'subcontractor' THEN 
      get_current_user_role() IN ('subcontractor', 'consultant', 'project_manager', 'superadmin')
    
    -- Business development: consultant
    WHEN required_role = 'consultant' THEN 
      get_current_user_role() IN ('consultant', 'project_manager', 'superadmin')
    
    -- Project management: project_manager
    WHEN required_role = 'project_manager' THEN 
      get_current_user_role() IN ('project_manager', 'superadmin')
    
    -- Super administrator: superadmin
    WHEN required_role = 'superadmin' THEN 
      get_current_user_role() = 'superadmin'
    
    ELSE false
  END;
$function$;

-- Update the role level function
CREATE OR REPLACE FUNCTION public.get_role_level(role_name user_role)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT CASE role_name
    WHEN 'client_viewer' THEN 1
    WHEN 'accounts' THEN 2
    WHEN 'subcontractor' THEN 3
    WHEN 'consultant' THEN 4
    WHEN 'project_manager' THEN 5
    WHEN 'superadmin' THEN 6
    ELSE 0
  END;
$function$;