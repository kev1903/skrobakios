-- Create a secure RPC to set a user's primary app role without triggering RLS recursion
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
    allowed := public.get_user_highest_role_level(requester_id) > public.get_user_highest_role_level(target_user_id);
  END IF;

  IF NOT allowed THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Replace all roles with the new primary role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN json_build_object('success', true, 'user_id', target_user_id, 'role', new_role);
END;
$$;

-- Ensure authenticated users can execute the function (logic inside enforces permissions)
GRANT EXECUTE ON FUNCTION public.set_user_primary_role(uuid, app_role) TO authenticated;