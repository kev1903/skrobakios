-- Create the missing get_user_role and get_user_roles functions

-- Function to get a user's primary/highest role
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get the highest priority role for the user
  SELECT role INTO user_role
  FROM user_roles 
  WHERE user_id = target_user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'platform_admin' THEN 2
      WHEN 'company_admin' THEN 3
    END
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'company_admin'::app_role);
END;
$$;

-- Function to get all of a user's roles as an array
CREATE OR REPLACE FUNCTION public.get_user_roles(target_user_id uuid)
RETURNS app_role[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  roles_array app_role[];
BEGIN
  -- Get all roles for the user as an array
  SELECT ARRAY_AGG(role ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'platform_admin' THEN 2
      WHEN 'company_admin' THEN 3
    END
  ) INTO roles_array
  FROM user_roles 
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(roles_array, ARRAY['company_admin'::app_role]);
END;
$$;