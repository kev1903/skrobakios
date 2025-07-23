-- Fix the get_manageable_users_for_user function to work with correct schema references
CREATE OR REPLACE FUNCTION public.get_manageable_users_for_user(requesting_user_id uuid)
RETURNS TABLE(
  user_id uuid, 
  email text, 
  first_name text, 
  last_name text, 
  avatar_url text, 
  phone text, 
  company text, 
  app_role app_role, 
  app_roles app_role[], 
  company_role text, 
  status text, 
  created_at timestamp with time zone, 
  can_manage_roles boolean, 
  can_assign_to_companies boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  requesting_user_level integer;
  is_superadmin boolean;
BEGIN
  -- Get requesting user's level and superadmin status without calling other functions
  SELECT CASE 
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'superadmin') THEN 100
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'business_admin') THEN 80
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'project_admin') THEN 60
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'user') THEN 40
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'client') THEN 20
    ELSE 0
  END INTO requesting_user_level;

  SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'superadmin') INTO is_superadmin;

  -- Return users based on hierarchy, ensuring each user appears only once
  RETURN QUERY
  SELECT DISTINCT ON (p.id) -- Use profile id instead of user_id
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.phone,
    p.company,
    -- Handle NULL user_id for invited users
    CASE 
      WHEN p.user_id IS NULL THEN 'user'::app_role
      ELSE COALESCE(
        (SELECT ur.role FROM user_roles ur WHERE ur.user_id = p.user_id ORDER BY 
          CASE ur.role
            WHEN 'superadmin' THEN 1
            WHEN 'business_admin' THEN 2
            WHEN 'project_admin' THEN 3
            WHEN 'user' THEN 4
            WHEN 'client' THEN 5
          END LIMIT 1), 
        'user'::app_role
      )
    END as app_role,
    -- Handle NULL user_id for invited users - return array of roles
    CASE 
      WHEN p.user_id IS NULL THEN ARRAY['user'::app_role]
      ELSE COALESCE(
        (SELECT ARRAY_AGG(ur.role ORDER BY 
          CASE ur.role
            WHEN 'superadmin' THEN 1
            WHEN 'business_admin' THEN 2
            WHEN 'project_admin' THEN 3
            WHEN 'user' THEN 4
            WHEN 'client' THEN 5
          END) FROM user_roles ur WHERE ur.user_id = p.user_id), 
        ARRAY['user'::app_role]
      )
    END as app_roles,
    -- Get the highest company role for this user (only for users with user_id)
    CASE
      WHEN p.user_id IS NULL THEN 'none'
      ELSE COALESCE(
        (SELECT cm_inner.role 
         FROM company_members cm_inner 
         WHERE cm_inner.user_id = p.user_id 
         AND cm_inner.status = 'active'
         ORDER BY 
           CASE cm_inner.role
             WHEN 'owner' THEN 1
             WHEN 'admin' THEN 2
             WHEN 'member' THEN 3
             ELSE 4
           END
         LIMIT 1), 
        'none'
      )
    END as company_role,
    p.status,
    p.created_at,
    -- Can manage roles if requesting user has higher level
    CASE 
      WHEN p.user_id IS NULL THEN is_superadmin -- Only superadmins can manage invited users
      ELSE (requesting_user_level > CASE 
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'superadmin') THEN 100
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'business_admin') THEN 80
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'project_admin') THEN 60
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'user') THEN 40
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'client') THEN 20
        ELSE 0
      END)
    END as can_manage_roles,
    -- Only superadmins can assign to companies
    is_superadmin as can_assign_to_companies
  FROM profiles p
  LEFT JOIN company_members cm ON p.user_id = cm.user_id AND cm.status = 'active'
  WHERE 
    -- Superadmins can see everyone including invited users
    (is_superadmin) 
    OR 
    -- Company owners can see their company members (excluding invited users for now)
    (p.user_id IS NOT NULL AND p.user_id IN (
      SELECT cm2.user_id 
      FROM company_members cm2 
      JOIN company_members requesting_cm ON cm2.company_id = requesting_cm.company_id
      WHERE requesting_cm.user_id = requesting_user_id 
      AND requesting_cm.role = 'owner' 
      AND requesting_cm.status = 'active'
      AND cm2.status = 'active'
    ))
  ORDER BY p.id, p.created_at DESC;
END;
$$;