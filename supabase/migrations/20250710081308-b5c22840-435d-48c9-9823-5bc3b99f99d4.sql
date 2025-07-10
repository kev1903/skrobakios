-- Update role hierarchy function to match current available roles
CREATE OR REPLACE FUNCTION public.has_role_or_higher(required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    -- Lowest privilege: client_viewer
    WHEN required_role = 'client_viewer' THEN 
      get_current_user_role() IN ('client_viewer', 'accounts', 'estimator', 'subcontractor', 'consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    
    -- Financial role: accounts  
    WHEN required_role = 'accounts' THEN 
      get_current_user_role() IN ('accounts', 'estimator', 'subcontractor', 'consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    
    -- Estimation role: estimator
    WHEN required_role = 'estimator' THEN 
      get_current_user_role() IN ('estimator', 'subcontractor', 'consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    
    -- External contractor: subcontractor
    WHEN required_role = 'subcontractor' THEN 
      get_current_user_role() IN ('subcontractor', 'consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    
    -- Business development: consultant
    WHEN required_role = 'consultant' THEN 
      get_current_user_role() IN ('consultant', 'project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    
    -- Project administration: project_admin
    WHEN required_role = 'project_admin' THEN 
      get_current_user_role() IN ('project_admin', 'project_manager', 'user', 'admin', 'superadmin')
    
    -- Project management: project_manager
    WHEN required_role = 'project_manager' THEN 
      get_current_user_role() IN ('project_manager', 'user', 'admin', 'superadmin')
    
    -- Standard user: user
    WHEN required_role = 'user' THEN 
      get_current_user_role() IN ('user', 'admin', 'superadmin')
    
    -- System administrator: admin
    WHEN required_role = 'admin' THEN 
      get_current_user_role() IN ('admin', 'superadmin')
    
    -- Super administrator: superadmin
    WHEN required_role = 'superadmin' THEN 
      get_current_user_role() = 'superadmin'
    
    ELSE false
  END;
$$;

-- Create a function to get role hierarchy level for easier comparison
CREATE OR REPLACE FUNCTION public.get_role_level(role_name user_role)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT CASE role_name
    WHEN 'client_viewer' THEN 1
    WHEN 'accounts' THEN 2
    WHEN 'estimator' THEN 3
    WHEN 'subcontractor' THEN 4
    WHEN 'consultant' THEN 5
    WHEN 'project_admin' THEN 6
    WHEN 'project_manager' THEN 7
    WHEN 'user' THEN 8
    WHEN 'admin' THEN 9
    WHEN 'superadmin' THEN 10
    ELSE 0
  END;
$$;

-- Create a helper function to check if current user has minimum role level
CREATE OR REPLACE FUNCTION public.has_minimum_role_level(min_level integer)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT get_role_level(get_current_user_role()) >= min_level;
$$;

-- Add role-based validation trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_role_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure user has valid role for the operation
  IF get_current_user_role() IS NULL THEN
    RAISE EXCEPTION 'User does not have a valid role assigned';
  END IF;
  
  -- Log role-based access for audit trail
  INSERT INTO task_activity_log (
    task_id,
    action_type,
    action_description,
    user_name,
    user_avatar
  ) VALUES (
    COALESCE(NEW.id::text, OLD.id::text, 'system'),
    'ROLE_ACCESS',
    'Role-based access: ' || TG_OP || ' on ' || TG_TABLE_NAME || ' by role: ' || get_current_user_role(),
    COALESCE((SELECT CONCAT(first_name, ' ', last_name) FROM profiles WHERE user_id = auth.uid()), 'System'),
    (SELECT avatar_url FROM profiles WHERE user_id = auth.uid())
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;