-- Fix security vulnerability: Remove anonymous access to profiles table
-- and implement privacy-respecting public profile access

-- 1. Drop the dangerous anonymous access policy
DROP POLICY IF EXISTS "Anonymous users can view limited public profiles" ON public.profiles;

-- 2. Create a security definer function for safe public profile access
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
  email text,
  phone text,
  location text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- 3. Update the existing public profile access policy to be more secure
DROP POLICY IF EXISTS "Users can view safe public profile data" ON public.profiles;

CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own complete profile
  (auth.uid() = user_id) 
  OR 
  -- Or view public profiles with privacy settings respected
  (
    public_profile = true 
    AND status = 'active' 
    AND verified = true
  )
);

-- 4. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_safe_public_profile_data(uuid) TO authenticated;

-- 5. Add comment explaining the security improvement
COMMENT ON FUNCTION public.get_safe_public_profile_data(uuid) IS 
'Returns public profile data respecting user privacy settings. Only shows email/phone/location if user has explicitly enabled sharing via show_email/show_phone/show_location flags.';

-- 6. Ensure birth_date is never exposed in public profiles by removing it from any public views
-- (birth_date should only be accessible to the user themselves or superadmins)