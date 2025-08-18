-- Fix the set_user_primary_role function to handle the constraint issue
CREATE OR REPLACE FUNCTION public.set_user_primary_role(
  target_user_id uuid,
  new_role app_role
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requester_id uuid := auth.uid();
  allowed boolean := false;
BEGIN
  IF requester_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Allow superadmins, or users with a higher level than the target
  IF public.is_superadmin(requester_id) THEN
    allowed := true;
  ELSE
    -- For now, just allow superadmins to change roles
    allowed := false;
  END IF;

  IF NOT allowed THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions - superadmin required');
  END IF;

  -- Replace all roles with the new primary role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);

  RETURN json_build_object('success', true, 'user_id', target_user_id, 'role', new_role);
END;
$$;