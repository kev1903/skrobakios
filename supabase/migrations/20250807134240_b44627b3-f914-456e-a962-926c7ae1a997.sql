-- Drop ALL existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create clean, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create separate policies for superadmins using the secure function
CREATE POLICY "Superadmins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role_secure(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmins can insert all profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmins can delete all profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role_secure(auth.uid(), 'superadmin'));