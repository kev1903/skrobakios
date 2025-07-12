-- Drop the existing function and recreate it with support for multiple roles
DROP FUNCTION IF EXISTS public.get_manageable_users_for_user(uuid);

-- Recreate the function with support for multiple roles
CREATE OR REPLACE FUNCTION public.get_manageable_users_for_user(requesting_user_id uuid)
 RETURNS TABLE(user_id uuid, email text, first_name text, last_name text, avatar_url text, phone text, company text, app_role app_role, app_roles app_role[], company_role text, status text, created_at timestamp with time zone, can_manage_roles boolean, can_assign_to_companies boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  requesting_user_level integer;
  is_superadmin boolean;
BEGIN
  -- Get requesting user's level and superadmin status
  SELECT get_user_highest_role_level(requesting_user_id) INTO requesting_user_level;
  SELECT has_role(requesting_user_id, 'superadmin') INTO is_superadmin;

  -- Return users based on hierarchy
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.phone,
    p.company,
    COALESCE(get_user_role(p.user_id), 'user'::app_role) as app_role,
    COALESCE(get_user_roles(p.user_id), ARRAY['user'::app_role]) as app_roles,
    COALESCE(cm.role, 'none') as company_role,
    p.status,
    p.created_at,
    -- Can manage roles if requesting user has higher level
    (requesting_user_level > get_user_highest_role_level(p.user_id)) as can_manage_roles,
    -- Only superadmins can assign to companies
    is_superadmin as can_assign_to_companies
  FROM profiles p
  LEFT JOIN company_members cm ON p.user_id = cm.user_id AND cm.status = 'active'
  WHERE 
    -- Superadmins can see everyone
    (is_superadmin) 
    OR 
    -- Company owners can see their company members
    (p.user_id IN (
      SELECT cm2.user_id 
      FROM company_members cm2 
      JOIN company_members requesting_cm ON cm2.company_id = requesting_cm.company_id
      WHERE requesting_cm.user_id = requesting_user_id 
      AND requesting_cm.role = 'owner' 
      AND requesting_cm.status = 'active'
      AND cm2.status = 'active'
    ))
  ORDER BY p.created_at DESC;
END;
$function$;