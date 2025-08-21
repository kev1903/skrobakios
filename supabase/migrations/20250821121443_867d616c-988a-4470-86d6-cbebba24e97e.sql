-- Allow superadmins to change any user's role, but prevent removing the last superadmin
CREATE OR REPLACE FUNCTION public.set_user_primary_role(target_user_id uuid, new_role app_role)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requester_id uuid := auth.uid();
  current_target_role app_role;
  superadmin_count integer;
  is_last_superadmin boolean := false;
BEGIN
  IF requester_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Only allow superadmins to change roles
  IF NOT public.is_superadmin(requester_id) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions - superadmin required');
  END IF;

  -- Get current role of target user
  SELECT role INTO current_target_role
  FROM public.user_roles 
  WHERE user_id = target_user_id
  ORDER BY CASE role
    WHEN 'superadmin' THEN 1
    WHEN 'business_admin' THEN 2
    WHEN 'project_admin' THEN 3
    WHEN 'user' THEN 4
    WHEN 'client' THEN 5
  END
  LIMIT 1;

  -- If changing from superadmin, check if this is the last superadmin
  IF current_target_role = 'superadmin' AND new_role != 'superadmin' THEN
    SELECT COUNT(*) INTO superadmin_count
    FROM public.user_roles 
    WHERE role = 'superadmin';
    
    IF superadmin_count <= 1 THEN
      is_last_superadmin := true;
    END IF;
  END IF;

  -- Prevent removing the last superadmin
  IF is_last_superadmin THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Cannot change the last superadmin role. At least one superadmin must exist.'
    );
  END IF;

  -- Replace all roles with the new primary role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);

  RETURN json_build_object('success', true, 'user_id', target_user_id, 'role', new_role);
END;
$$;

-- Create function to safely add/remove individual roles
CREATE OR REPLACE FUNCTION public.manage_user_role(target_user_id uuid, role_to_manage app_role, operation text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requester_id uuid := auth.uid();
  superadmin_count integer;
  is_last_superadmin boolean := false;
  role_exists boolean;
BEGIN
  IF requester_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Only allow superadmins to manage roles
  IF NOT public.is_superadmin(requester_id) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions - superadmin required');
  END IF;

  -- Check if role exists for user
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id AND role = role_to_manage
  ) INTO role_exists;

  IF operation = 'add' THEN
    IF role_exists THEN
      RETURN json_build_object('success', false, 'error', 'User already has this role');
    END IF;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, role_to_manage);
    
    RETURN json_build_object('success', true, 'action', 'added', 'role', role_to_manage);
    
  ELSIF operation = 'remove' THEN
    IF NOT role_exists THEN
      RETURN json_build_object('success', false, 'error', 'User does not have this role');
    END IF;
    
    -- If removing superadmin, check if this is the last one
    IF role_to_manage = 'superadmin' THEN
      SELECT COUNT(*) INTO superadmin_count
      FROM public.user_roles 
      WHERE role = 'superadmin';
      
      IF superadmin_count <= 1 THEN
        RETURN json_build_object(
          'success', false, 
          'error', 'Cannot remove the last superadmin role. At least one superadmin must exist.'
        );
      END IF;
    END IF;
    
    -- Check if user would have no roles left
    IF (SELECT COUNT(*) FROM public.user_roles WHERE user_id = target_user_id) <= 1 THEN
      RETURN json_build_object('success', false, 'error', 'User must have at least one role');
    END IF;
    
    DELETE FROM public.user_roles 
    WHERE user_id = target_user_id AND role = role_to_manage;
    
    RETURN json_build_object('success', true, 'action', 'removed', 'role', role_to_manage);
    
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid operation. Use "add" or "remove"');
  END IF;
END;
$$;