-- Update the app_role enum to only include the three platform roles
-- First, we need to update any existing user roles that use the roles we're removing

-- Update 'admin' roles to 'platform_admin'
UPDATE public.user_roles 
SET role = 'platform_admin'::app_role 
WHERE role = 'admin'::app_role;

-- Update 'user' roles to 'company_admin' 
UPDATE public.user_roles 
SET role = 'company_admin'::app_role 
WHERE role = 'user'::app_role;

-- Update 'owner' roles to 'company_admin'
UPDATE public.user_roles 
SET role = 'company_admin'::app_role 
WHERE role = 'owner'::app_role;

-- Now drop the existing enum and recreate with only the three desired values
DROP TYPE IF EXISTS app_role CASCADE;

-- Create the new enum with only three platform roles
CREATE TYPE app_role AS ENUM (
  'superadmin',
  'platform_admin', 
  'company_admin'
);

-- Recreate the user_roles table with the updated enum
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE app_role USING role::text::app_role;

-- Update the default value for the role column
ALTER TABLE public.user_roles 
ALTER COLUMN role SET DEFAULT 'company_admin'::app_role;

-- Recreate any functions that reference the old enum values
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

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

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