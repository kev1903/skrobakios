-- Fix the policy conflicts by dropping all existing profiles policies first
-- Then create clean, non-conflicting policies

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profile access control" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create single, clear RLS policy set for profiles
CREATE POLICY "unified_profile_select" ON public.profiles
FOR SELECT USING (
  -- Users can always view their own profile
  user_id = auth.uid() 
  OR 
  -- Public profiles are viewable by authenticated users
  (public_profile = true AND auth.role() = 'authenticated')
  OR
  -- Company members can view each other's profiles
  EXISTS (
    SELECT 1 FROM company_members cm1
    JOIN company_members cm2 ON cm1.company_id = cm2.company_id
    WHERE cm1.user_id = auth.uid() 
    AND cm2.user_id = profiles.user_id
    AND cm1.status = 'active' 
    AND cm2.status = 'active'
  )
);

CREATE POLICY "users_update_own_profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_insert_own_profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());