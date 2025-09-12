-- Fix User Personal Information Harvesting Vulnerability
-- Remove overly permissive public profile access and secure sensitive data

-- Step 1: Drop the overly permissive "Safe public profile access" policy
DROP POLICY IF EXISTS "Safe public profile access" ON public.profiles;

-- Step 2: Create a more restrictive public profile view that excludes ALL sensitive data
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

CREATE VIEW public.safe_public_profiles 
WITH (security_invoker=on) AS
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
  -- SECURITY: Never expose sensitive contact information publicly
  -- Users can contact through platform messaging instead
  NULL::text as email,
  NULL::text as phone, 
  NULL::text as location,
  NULL::date as birth_date,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.public_profile = true 
AND p.status = 'active'
AND p.verified = true; -- Only show verified profiles publicly

-- Step 3: Create a secure contact request system instead of exposing emails/phones
-- This table will log contact requests and prevent abuse
CREATE TABLE IF NOT EXISTS public.profile_contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users(id),
  target_profile_id uuid NOT NULL,
  message text NOT NULL,
  contact_reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  -- Rate limiting: max 5 requests per user per day
  CONSTRAINT reasonable_message_length CHECK (length(message) BETWEEN 10 AND 1000)
);

-- Enable RLS on contact requests table
ALTER TABLE public.profile_contact_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create contact requests (with rate limiting)
CREATE POLICY "Users can create contact requests" 
ON public.profile_contact_requests 
FOR INSERT 
TO authenticated
WITH CHECK (
  requester_id = auth.uid() 
  AND NOT EXISTS (
    -- Rate limit: max 5 requests per day per user
    SELECT 1 FROM public.profile_contact_requests 
    WHERE requester_id = auth.uid() 
    AND created_at > now() - interval '24 hours'
    GROUP BY requester_id
    HAVING COUNT(*) >= 5
  )
);

-- Policy: Users can view their own sent requests
CREATE POLICY "Users can view own contact requests" 
ON public.profile_contact_requests 
FOR SELECT 
TO authenticated
USING (requester_id = auth.uid());

-- Policy: Profile owners can view requests sent to them
CREATE POLICY "Profile owners can view incoming requests" 
ON public.profile_contact_requests 
FOR SELECT 
TO authenticated
USING (
  target_profile_id IN (
    SELECT user_id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Step 4: Create audit logging for profile access to detect harvesting attempts
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id uuid,
  accessed_profile_id uuid NOT NULL,
  access_type text NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on access logs
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert access logs (for security monitoring)
CREATE POLICY "Service role can insert access logs" 
ON public.profile_access_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Superadmins can view access logs for security monitoring
CREATE POLICY "Superadmins can view access logs" 
ON public.profile_access_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- Step 5: Create a function to safely get public profile data with logging
CREATE OR REPLACE FUNCTION public.get_public_profile_safely(profile_user_id uuid)
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log the access attempt for security monitoring
  INSERT INTO public.profile_access_logs (
    accessor_id,
    accessed_profile_id,
    access_type,
    created_at
  ) VALUES (
    auth.uid(),
    profile_user_id,
    'public_profile_view',
    now()
  );

  -- Return only non-sensitive public profile data
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
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
  AND p.public_profile = true
  AND p.status = 'active'
  AND p.verified = true;
END;
$$;

-- Step 6: Grant appropriate permissions
GRANT SELECT ON public.safe_public_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_safely(uuid) TO authenticated;

-- Step 7: Create updated trigger for profile access rate limiting
CREATE OR REPLACE FUNCTION public.check_profile_access_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id uuid := auth.uid();
  recent_accesses integer;
  rate_limit integer := 50; -- Max 50 profile views per hour
  time_window interval := '1 hour';
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Count recent profile access attempts
  SELECT COUNT(*) INTO recent_accesses
  FROM public.profile_access_logs
  WHERE accessor_id = user_id
    AND access_type = 'public_profile_view'
    AND created_at > (now() - time_window);

  -- Block if rate limit exceeded
  IF recent_accesses >= rate_limit THEN
    -- Log potential harvesting attempt
    INSERT INTO public.security_events (
      user_id, event_type, severity, metadata, created_at
    ) VALUES (
      user_id,
      'profile_access_rate_limit_exceeded',
      'high',
      jsonb_build_object(
        'attempts', recent_accesses,
        'limit', rate_limit,
        'window_hours', extract(epoch from time_window) / 3600,
        'potential_harvesting', true
      ),
      now()
    );
    
    RETURN false;
  END IF;

  RETURN true;
END;
$$;