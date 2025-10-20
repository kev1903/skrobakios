-- Update the get_manageable_users_for_user function to properly fetch user data from auth.users
-- This fixes the "Unknown User" issue by ensuring we always get email and user data

CREATE OR REPLACE FUNCTION public.get_manageable_users_for_user(requesting_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  app_role app_role,
  app_roles app_role[],
  company_role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  can_manage_roles BOOLEAN,
  can_assign_to_companies BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_is_superadmin BOOLEAN;
BEGIN
  -- Check if requesting user is a superadmin
  requester_is_superadmin := EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = requesting_user_id 
    AND user_roles.role = 'superadmin'::app_role
  );

  -- If superadmin, return all users with data from auth.users and profiles
  IF requester_is_superadmin THEN
    RETURN QUERY
    SELECT DISTINCT ON (au.id)
      au.id AS user_id,
      COALESCE(p.email, au.email) AS email,
      p.first_name,
      p.last_name,
      p.avatar_url,
      p.phone,
      c.name AS company,
      COALESCE(
        (SELECT ur.role FROM user_roles ur WHERE ur.user_id = au.id ORDER BY 
          CASE ur.role
            WHEN 'superadmin'::app_role THEN 1
            WHEN 'business_admin'::app_role THEN 2
            WHEN 'project_admin'::app_role THEN 3
            WHEN 'user'::app_role THEN 4
            WHEN 'client'::app_role THEN 5
            ELSE 6
          END
        LIMIT 1),
        'user'::app_role
      ) AS app_role,
      COALESCE(
        ARRAY(SELECT ur.role FROM user_roles ur WHERE ur.user_id = au.id ORDER BY ur.role),
        ARRAY['user'::app_role]
      ) AS app_roles,
      COALESCE(cm.role, 'none') AS company_role,
      COALESCE(p.status, 'active') AS status,
      au.created_at,
      TRUE AS can_manage_roles,
      TRUE AS can_assign_to_companies
    FROM auth.users au
    LEFT JOIN profiles p ON p.user_id = au.id
    LEFT JOIN company_members cm ON cm.user_id = au.id AND cm.status = 'active'
    LEFT JOIN companies c ON c.id = cm.company_id
    ORDER BY au.id, au.created_at DESC;
  ELSE
    -- Non-superadmin users can only see users in their companies
    RETURN QUERY
    SELECT DISTINCT ON (au.id)
      au.id AS user_id,
      COALESCE(p.email, au.email) AS email,
      p.first_name,
      p.last_name,
      p.avatar_url,
      p.phone,
      c.name AS company,
      COALESCE(
        (SELECT ur.role FROM user_roles ur WHERE ur.user_id = au.id ORDER BY 
          CASE ur.role
            WHEN 'superadmin'::app_role THEN 1
            WHEN 'business_admin'::app_role THEN 2
            WHEN 'project_admin'::app_role THEN 3
            WHEN 'user'::app_role THEN 4
            WHEN 'client'::app_role THEN 5
            ELSE 6
          END
        LIMIT 1),
        'user'::app_role
      ) AS app_role,
      COALESCE(
        ARRAY(SELECT ur.role FROM user_roles ur WHERE ur.user_id = au.id ORDER BY ur.role),
        ARRAY['user'::app_role]
      ) AS app_roles,
      COALESCE(cm.role, 'none') AS company_role,
      COALESCE(p.status, 'active') AS status,
      au.created_at,
      FALSE AS can_manage_roles,
      FALSE AS can_assign_to_companies
    FROM auth.users au
    LEFT JOIN profiles p ON p.user_id = au.id
    LEFT JOIN company_members cm ON cm.user_id = au.id AND cm.status = 'active'
    LEFT JOIN companies c ON c.id = cm.company_id
    WHERE cm.company_id IN (
      SELECT cm2.company_id 
      FROM company_members cm2 
      WHERE cm2.user_id = requesting_user_id 
      AND cm2.status = 'active'
    )
    ORDER BY au.id, au.created_at DESC;
  END IF;
END;
$$;