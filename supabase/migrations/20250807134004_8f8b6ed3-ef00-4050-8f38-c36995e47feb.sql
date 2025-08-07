-- Check current policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' OR tablename = 'user_roles';

-- Fix the infinite recursion by dropping problematic policies and recreating them properly
-- Drop any policies that might be causing recursion
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create simple, non-recursive policies for profiles
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

-- Superadmins can manage all profiles using the secure function
CREATE POLICY "Superadmins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role_secure(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role_secure(auth.uid(), 'superadmin'));