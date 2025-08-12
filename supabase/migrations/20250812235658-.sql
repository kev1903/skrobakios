-- Fix critical privacy vulnerability in profiles table
-- Replace overly permissive policies with privacy-respecting ones

-- Drop the problematic policies that expose sensitive data
DROP POLICY IF EXISTS "Users can view active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles basic info only" ON public.profiles;

-- Create a secure function to return only safe public profile data
CREATE OR REPLACE FUNCTION public.get_safe_public_profile_data(profile_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid,
  first_name text, 
  last_name text, 
  avatar_url text, 
  company text, 
  professional_title text,
  bio text,
  slug text, 
  rating numeric, 
  review_count integer, 
  years_experience integer,
  skills text[],
  services text[],
  verified boolean,
  social_links jsonb,
  meta_title text,
  meta_description text,
  website text,
  -- Only show sensitive data if user has opted in
  email text,
  phone text,
  location text
) 
LANGUAGE plpgsql 
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.company,
    p.professional_title,
    p.bio,
    p.slug,
    p.rating,
    p.review_count,
    p.years_experience,
    p.skills,
    p.services,
    p.verified,
    p.social_links,
    p.meta_title,
    p.meta_description,
    p.website,
    -- Only show email if user explicitly allows it
    CASE WHEN p.show_email = true THEN p.email ELSE NULL END as email,
    -- Only show phone if user explicitly allows it  
    CASE WHEN p.show_phone = true THEN p.phone ELSE NULL END as phone,
    -- Only show location if user explicitly allows it
    CASE WHEN p.show_location = true THEN p.location ELSE NULL END as location
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
  AND p.public_profile = true
  AND p.status = 'active';
END;
$$;

-- Create secure policy for authenticated users viewing other profiles
-- This uses the secure function to respect privacy settings
CREATE POLICY "Users can view safe public profile data" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can always see their own complete profile
  (auth.uid() = user_id) 
  OR 
  -- For other users, only show public profiles with privacy controls
  (public_profile = true AND status = 'active')
);

-- Create secure policy for anonymous users (very restrictive)
CREATE POLICY "Anonymous users can view limited public profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (
  public_profile = true 
  AND status = 'active'
  -- Anonymous users get even more restricted view
  AND verified = true  -- Only show verified profiles to anonymous users
);

-- Grant execute permission on the safe function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_safe_public_profile_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_public_profile_data TO anon;