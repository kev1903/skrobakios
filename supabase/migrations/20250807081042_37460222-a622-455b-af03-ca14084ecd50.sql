-- Add RLS policies for user_roles table
-- First drop any existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Policy for users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for superadmins to manage all roles
CREATE POLICY "Superadmins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'superadmin'
  )
);

-- Policy for service role (used by edge functions)
CREATE POLICY "Service role can manage roles" 
ON public.user_roles 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Also fix the old trigger function that references deprecated role
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;

-- Create corrected trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Assign default 'user' role to new users (corrected from 'company_admin')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role);
  
  RETURN NEW;
END;
$$;

-- Update the old function using the old enum value
UPDATE public.user_roles 
SET role = 'business_admin'::app_role 
WHERE role = 'company_admin'::app_role;

-- Also ensure we have proper policies for profiles table that work with user_roles
-- First check if the profiles policies need updating for superadmin access
DO $$
BEGIN
  -- Remove old policy that might conflict
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Superadmins can manage all profiles'
  ) THEN
    DROP POLICY "Superadmins can manage all profiles" ON public.profiles;
  END IF;
  
  -- Add proper superadmin policy for profiles
  EXECUTE 'CREATE POLICY "Superadmins can manage all profiles" 
    ON public.profiles 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = ''superadmin''::app_role
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = ''superadmin''::app_role
      )
    )';
END;
$$;