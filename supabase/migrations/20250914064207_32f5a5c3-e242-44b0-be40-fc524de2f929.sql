-- Fix security issue: Strengthen profile data protection and privacy controls
-- Address potential leaks of personal information from profiles table

-- First, let's add better privacy controls and audit logging
-- Add new privacy settings for more granular control
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_birth_date boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS data_processing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT 'private' CHECK (privacy_level IN ('private', 'friends', 'public'));

-- Create a secure function to check if profile data can be accessed
CREATE OR REPLACE FUNCTION public.can_access_profile_data(
  target_user_id uuid, 
  requesting_user_id uuid DEFAULT auth.uid(),
  data_type text DEFAULT 'basic'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  profile_settings RECORD;
BEGIN
  -- Get the target user's privacy settings
  SELECT 
    public_profile,
    show_email,
    show_phone, 
    show_location,
    show_birth_date,
    privacy_level,
    data_processing_consent
  INTO profile_settings
  FROM public.profiles 
  WHERE user_id = target_user_id;
  
  -- Users can always access their own data
  IF target_user_id = requesting_user_id THEN
    RETURN true;
  END IF;
  
  -- Check if profile is public and user consented to data processing
  IF NOT profile_settings.public_profile OR NOT profile_settings.data_processing_consent THEN
    RETURN false;
  END IF;
  
  -- Check specific data type permissions
  CASE data_type
    WHEN 'email' THEN
      RETURN profile_settings.show_email;
    WHEN 'phone' THEN  
      RETURN profile_settings.show_phone;
    WHEN 'location' THEN
      RETURN profile_settings.show_location;
    WHEN 'birth_date' THEN
      RETURN false; -- Never expose birth date publicly
    WHEN 'sensitive' THEN
      RETURN false; -- Never expose sensitive data publicly
    ELSE
      RETURN profile_settings.public_profile;
  END CASE;
END;
$$;

-- Create a new secure public profile function that respects all privacy settings
CREATE OR REPLACE FUNCTION public.get_secure_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  avatar_url text,
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
  company text,
  email text,
  phone text,
  location text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Rate limiting check
  IF NOT public.check_profile_access_rate_limit() THEN
    RAISE EXCEPTION 'Rate limit exceeded for profile access';
  END IF;

  -- Log the access attempt
  INSERT INTO public.profile_access_logs (
    accessor_id,
    accessed_profile_id,
    access_type,
    created_at
  ) VALUES (
    auth.uid(),
    profile_user_id,
    'secure_public_profile_view',
    now()
  );

  -- Return data based on privacy settings
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    CASE WHEN public.can_access_profile_data(p.user_id, auth.uid(), 'basic') 
         THEN p.first_name ELSE NULL END,
    CASE WHEN public.can_access_profile_data(p.user_id, auth.uid(), 'basic') 
         THEN p.last_name ELSE NULL END,
    p.avatar_url,
    p.professional_title,
    CASE WHEN public.can_access_profile_data(p.user_id, auth.uid(), 'basic') 
         THEN p.bio ELSE NULL END,
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
    p.company,
    CASE WHEN public.can_access_profile_data(p.user_id, auth.uid(), 'email') 
         THEN p.email ELSE NULL END,
    CASE WHEN public.can_access_profile_data(p.user_id, auth.uid(), 'phone') 
         THEN p.phone ELSE NULL END,
    CASE WHEN public.can_access_profile_data(p.user_id, auth.uid(), 'location') 
         THEN p.location ELSE NULL END
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.public_profile = true
    AND p.status = 'active'
    AND p.data_processing_consent = true;
END;
$$;

-- Create table for profile access logging (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id uuid REFERENCES auth.users(id),
  accessed_profile_id uuid NOT NULL,
  access_type text NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profile access logs
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for profile access logs
CREATE POLICY "Users can view logs of their own profile access"
ON public.profile_access_logs
FOR SELECT
USING (
  accessed_profile_id = auth.uid() 
  OR 
  accessor_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- Create policy for inserting access logs
CREATE POLICY "System can insert profile access logs"
ON public.profile_access_logs
FOR INSERT
WITH CHECK (true);

-- Create a trigger to automatically log sensitive profile updates
CREATE OR REPLACE FUNCTION public.log_profile_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log changes to privacy-sensitive fields
  IF OLD.show_email != NEW.show_email 
     OR OLD.show_phone != NEW.show_phone 
     OR OLD.show_location != NEW.show_location 
     OR OLD.public_profile != NEW.public_profile 
     OR OLD.show_birth_date != NEW.show_birth_date THEN
    
    INSERT INTO public.security_events (
      user_id,
      event_type,
      severity,
      metadata,
      created_at
    ) VALUES (
      NEW.user_id,
      'profile_privacy_settings_changed',
      'info',
      jsonb_build_object(
        'old_settings', jsonb_build_object(
          'show_email', OLD.show_email,
          'show_phone', OLD.show_phone,
          'show_location', OLD.show_location,
          'public_profile', OLD.public_profile,
          'show_birth_date', COALESCE(OLD.show_birth_date, false)
        ),
        'new_settings', jsonb_build_object(
          'show_email', NEW.show_email,
          'show_phone', NEW.show_phone,
          'show_location', NEW.show_location,
          'public_profile', NEW.public_profile,
          'show_birth_date', COALESCE(NEW.show_birth_date, false)
        )
      ),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS profile_privacy_changes_trigger ON public.profiles;
CREATE TRIGGER profile_privacy_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_sensitive_changes();

-- Update existing profiles to have proper privacy defaults
UPDATE public.profiles 
SET 
  show_birth_date = false,
  data_processing_consent = CASE 
    WHEN public_profile = true THEN true 
    ELSE false 
  END,
  privacy_level = CASE 
    WHEN public_profile = true THEN 'public'
    ELSE 'private'
  END
WHERE show_birth_date IS NULL 
   OR data_processing_consent IS NULL 
   OR privacy_level IS NULL;

-- Add comments to document the security improvements
COMMENT ON FUNCTION public.can_access_profile_data(uuid, uuid, text) IS 
'Secure function to check if profile data can be accessed based on privacy settings and user consent';

COMMENT ON FUNCTION public.get_secure_public_profile(uuid) IS 
'Secure public profile function that respects all privacy settings, includes rate limiting and access logging';

COMMENT ON TABLE public.profile_access_logs IS 
'Audit log for tracking access to profile data for security monitoring';