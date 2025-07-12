-- Step 2: Update existing data to use new role names
UPDATE public.user_roles 
SET role = CASE 
  WHEN role = 'admin' THEN 'platform_admin'::app_role
  WHEN role = 'user' THEN 'company_admin'::app_role
  ELSE role
END;

-- Step 3: Update default value for new users
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'company_admin'::app_role;

-- Step 4: Update all database functions to use new role names
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'platform_admin' THEN 2
      WHEN 'company_admin' THEN 3
    END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'platform_admin' THEN 2
      WHEN 'company_admin' THEN 3
    END
  )
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.get_user_highest_role_level(target_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  highest_level integer := 0;
  app_role_level integer := 0;
  company_role_level integer := 0;
BEGIN
  -- Check app-level role (superadmin has highest level)
  SELECT CASE 
    WHEN role = 'superadmin' THEN 100
    WHEN role = 'platform_admin' THEN 60
    WHEN role = 'company_admin' THEN 40
    ELSE 0
  END INTO app_role_level
  FROM user_roles 
  WHERE user_id = target_user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'platform_admin' THEN 2
      WHEN 'company_admin' THEN 3
    END
  LIMIT 1;

  -- Check company-level role (owner > admin > member)
  SELECT CASE 
    WHEN role = 'owner' THEN 90
    WHEN role = 'admin' THEN 70
    WHEN role = 'member' THEN 50
    ELSE 0
  END INTO company_role_level
  FROM company_members 
  WHERE user_id = target_user_id 
  AND status = 'active'
  ORDER BY 
    CASE role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'member' THEN 3
    END
  LIMIT 1;

  -- Return the highest level (app roles take precedence for platform management)
  RETURN GREATEST(COALESCE(app_role_level, 0), COALESCE(company_role_level, 0));
END;
$$;

CREATE OR REPLACE FUNCTION public.get_manageable_users_for_user(requesting_user_id uuid)
RETURNS TABLE(user_id uuid, email text, first_name text, last_name text, avatar_url text, phone text, company text, app_role app_role, app_roles app_role[], company_role text, status text, created_at timestamp with time zone, can_manage_roles boolean, can_assign_to_companies boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
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
    COALESCE(get_user_role(p.user_id), 'company_admin'::app_role) as app_role,
    COALESCE(get_user_roles(p.user_id), ARRAY['company_admin'::app_role]) as app_roles,
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
$$;