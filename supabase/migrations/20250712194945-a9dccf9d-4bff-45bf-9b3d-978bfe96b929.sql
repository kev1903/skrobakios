-- Update the app_role enum to only include the three platform roles
-- First, we need to safely migrate existing data and recreate the enum

-- Step 1: Create a temporary column to store the current roles as text
ALTER TABLE public.user_roles ADD COLUMN temp_role text;

-- Step 2: Copy current role values to the temporary column, mapping old roles to new ones
UPDATE public.user_roles 
SET temp_role = CASE 
  WHEN role = 'admin'::app_role THEN 'platform_admin'
  WHEN role = 'user'::app_role THEN 'company_admin' 
  WHEN role = 'owner'::app_role THEN 'company_admin'
  WHEN role = 'superadmin'::app_role THEN 'superadmin'
  WHEN role = 'platform_admin'::app_role THEN 'platform_admin'
  WHEN role = 'company_admin'::app_role THEN 'company_admin'
  ELSE 'company_admin'
END;

-- Step 3: Drop the role column
ALTER TABLE public.user_roles DROP COLUMN role;

-- Step 4: Drop and recreate the enum type
DROP TYPE IF EXISTS app_role CASCADE;

CREATE TYPE app_role AS ENUM (
  'superadmin',
  'platform_admin', 
  'company_admin'
);

-- Step 5: Add the role column back with the new enum type
ALTER TABLE public.user_roles 
ADD COLUMN role app_role DEFAULT 'company_admin'::app_role;

-- Step 6: Update the role column with the mapped values
UPDATE public.user_roles 
SET role = temp_role::app_role;

-- Step 7: Drop the temporary column
ALTER TABLE public.user_roles DROP COLUMN temp_role;

-- Step 8: Make role column NOT NULL
ALTER TABLE public.user_roles ALTER COLUMN role SET NOT NULL;