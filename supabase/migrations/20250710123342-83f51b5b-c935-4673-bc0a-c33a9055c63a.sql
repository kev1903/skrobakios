-- Update any existing users with the roles we're removing to safe alternatives
UPDATE public.user_roles 
SET role = CASE 
  WHEN role = 'project_admin' THEN 'project_manager'
  WHEN role = 'estimator' THEN 'consultant'
  WHEN role = 'admin' THEN 'project_manager'
  WHEN role = 'user' THEN 'client_viewer'
  ELSE role
END
WHERE role IN ('project_admin', 'estimator', 'admin', 'user');

-- Update any pending invitations with the roles we're removing
UPDATE public.user_invitations 
SET invited_role = CASE 
  WHEN invited_role = 'project_admin' THEN 'project_manager'
  WHEN invited_role = 'estimator' THEN 'consultant'
  WHEN invited_role = 'admin' THEN 'project_manager'
  WHEN invited_role = 'user' THEN 'client_viewer'
  ELSE invited_role
END
WHERE invited_role IN ('project_admin', 'estimator', 'admin', 'user');

-- Now update function to work with remaining roles only
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

-- Update role level function to work with remaining roles
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