-- Fix security linter warnings for profile access functions

-- Fix search path for log_profile_access function
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log when someone accesses another user's profile
  IF NEW.user_id != auth.uid() AND TG_OP = 'SELECT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata,
      created_at
    ) VALUES (
      auth.uid(),
      'profile_view',
      'profile',
      NEW.id,
      jsonb_build_object(
        'viewed_user_id', NEW.user_id,
        'public_profile', NEW.public_profile,
        'show_email', NEW.show_email,
        'show_phone', NEW.show_phone,
        'show_location', NEW.show_location
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix search path for log_sensitive_profile_access function
CREATE OR REPLACE FUNCTION public.log_sensitive_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to profiles with sensitive data exposed
  IF TG_OP = 'SELECT' AND (NEW.show_email = true OR NEW.show_phone = true) THEN
    INSERT INTO public.security_events (
      user_id,
      event_type,
      severity,
      metadata,
      created_at
    ) VALUES (
      auth.uid(),
      'sensitive_profile_data_access',
      'info',
      jsonb_build_object(
        'accessed_user_id', NEW.user_id,
        'email_exposed', NEW.show_email,
        'phone_exposed', NEW.show_phone,
        'location_exposed', NEW.show_location,
        'birth_date_requested', (NEW.birth_date IS NOT NULL)
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix search path for check_profile_access_rate_limit function
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
  FROM public.audit_logs
  WHERE user_id = check_profile_access_rate_limit.user_id
    AND action = 'profile_view'
    AND created_at > (now() - time_window);

  -- Log and block if rate limit exceeded
  IF recent_accesses >= rate_limit THEN
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

-- Remove the security definer view and replace with regular view
DROP VIEW IF EXISTS public.safe_public_profiles;

-- Create a regular view instead (not security definer)
CREATE VIEW public.safe_public_profiles AS
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
  -- Only show sensitive data if user allows it
  CASE WHEN p.show_email = true THEN p.email ELSE NULL END as email,
  CASE WHEN p.show_phone = true THEN p.phone ELSE NULL END as phone,
  CASE WHEN p.show_location = true THEN p.location ELSE NULL END as location,
  -- Never expose birth date publicly
  NULL as birth_date,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.public_profile = true 
AND p.status = 'active'
AND public.can_view_profile_safely(p.user_id);

-- Grant select access to authenticated users on the view
GRANT SELECT ON public.safe_public_profiles TO authenticated;