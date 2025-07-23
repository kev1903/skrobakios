-- Update the app_role enum to include the new roles: Super Admin, Business Admin, Project Admin, User, and Client
-- First, we need to safely migrate existing data and recreate the enum

-- Step 1: Create a temporary column to store the current roles as text
ALTER TABLE public.user_roles ADD COLUMN temp_role text;

-- Step 2: Copy current role values to the temporary column, mapping old roles to new ones
UPDATE public.user_roles 
SET temp_role = CASE 
  WHEN role = 'superadmin'::app_role THEN 'superadmin'
  WHEN role = 'platform_admin'::app_role THEN 'business_admin' 
  WHEN role = 'company_admin'::app_role THEN 'user'
  ELSE 'user'
END;

-- Step 3: Drop the role column
ALTER TABLE public.user_roles DROP COLUMN role;

-- Step 4: Drop and recreate the enum type
DROP TYPE IF EXISTS app_role CASCADE;

CREATE TYPE app_role AS ENUM (
  'superadmin',
  'business_admin', 
  'project_admin',
  'user',
  'client'
);

-- Step 5: Add the role column back with the new enum type
ALTER TABLE public.user_roles 
ADD COLUMN role app_role DEFAULT 'user'::app_role;

-- Step 6: Update the role column with the mapped values
UPDATE public.user_roles 
SET role = temp_role::app_role;

-- Step 7: Drop the temporary column
ALTER TABLE public.user_roles DROP COLUMN temp_role;

-- Step 8: Make role column NOT NULL
ALTER TABLE public.user_roles ALTER COLUMN role SET NOT NULL;

-- Step 9: Recreate functions that depend on the app_role enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

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
      WHEN 'business_admin' THEN 2
      WHEN 'project_admin' THEN 3
      WHEN 'user' THEN 4
      WHEN 'client' THEN 5
    END
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user'::app_role);
END;
$$;

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
      WHEN 'business_admin' THEN 2
      WHEN 'project_admin' THEN 3
      WHEN 'user' THEN 4
      WHEN 'client' THEN 5
    END
  ) INTO roles_array
  FROM user_roles 
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(roles_array, ARRAY['user'::app_role]);
END;
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
    WHEN role = 'business_admin' THEN 80
    WHEN role = 'project_admin' THEN 60
    WHEN role = 'user' THEN 40
    WHEN role = 'client' THEN 20
    ELSE 0
  END INTO app_role_level
  FROM user_roles 
  WHERE user_id = target_user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'business_admin' THEN 2
      WHEN 'project_admin' THEN 3
      WHEN 'user' THEN 4
      WHEN 'client' THEN 5
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

  -- Return users based on hierarchy, ensuring each user appears only once
  RETURN QUERY
  SELECT DISTINCT ON (p.user_id)
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.phone,
    p.company,
    COALESCE(get_user_role(p.user_id), 'user'::app_role) as app_role,
    COALESCE(get_user_roles(p.user_id), ARRAY['user'::app_role]) as app_roles,
    -- Get the highest company role for this user
    COALESCE(
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
    ) as company_role,
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
  ORDER BY p.user_id, p.created_at DESC;
END;
$$;