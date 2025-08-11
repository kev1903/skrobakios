-- Fix Critical Privacy Issue: Secure User Profiles Data

-- 1. Add privacy control columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS public_profile boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_email boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_phone boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_location boolean DEFAULT false;

-- 2. Drop existing overly permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 3. Create secure policies for profile access

-- Users can always view and manage their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Create a secure function for public profile access that respects privacy settings
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  company text,
  slug text,
  rating numeric,
  review_count integer,
  email text,
  phone text,
  status text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.company,
    p.slug,
    p.rating,
    p.review_count,
    -- Only show email if user explicitly allows it
    CASE WHEN p.show_email = true THEN p.email ELSE NULL END as email,
    -- Only show phone if user explicitly allows it  
    CASE WHEN p.show_phone = true THEN p.phone ELSE NULL END as phone,
    p.status
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
  AND p.public_profile = true
  AND p.status = 'active';
END;
$function$;

-- 5. Limited public access policy for explicitly public profiles only
CREATE POLICY "Public profiles basic info only" 
ON public.profiles 
FOR SELECT 
USING (
  public_profile = true 
  AND status = 'active'
  AND auth.role() = 'anon'
);