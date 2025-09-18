-- Create a security definer function to check if user is superadmin
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_superadmin(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = target_user_id 
    AND ur.role = 'superadmin'
  );
END;
$$;

-- Update RLS policies for platform_settings to use the function
DROP POLICY IF EXISTS "Superadmins can manage platform settings" ON public.platform_settings;
CREATE POLICY "Superadmins can manage platform settings"
ON public.platform_settings
FOR ALL
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

-- Update RLS policies for feature_flags to use the function  
DROP POLICY IF EXISTS "Superadmins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Superadmins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

-- Update RLS policies for user_roles to use the function
DROP POLICY IF EXISTS "Superadmins can manage all user roles" ON public.user_roles;
CREATE POLICY "Superadmins can manage all user roles"
ON public.user_roles
FOR ALL  
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());