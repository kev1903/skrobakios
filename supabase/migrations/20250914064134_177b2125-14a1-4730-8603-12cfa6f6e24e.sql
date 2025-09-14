-- Fix security warnings: Set proper search_path for functions

-- Update existing functions to have secure search_path
CREATE OR REPLACE FUNCTION public.is_company_member_secure(company_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members cm 
    WHERE cm.company_id = is_company_member_secure.company_id 
    AND cm.user_id = is_company_member_secure.user_id 
    AND cm.status = 'active'
  );
END;
$$;

-- Update the get_public_company_profile function to be more secure
CREATE OR REPLACE FUNCTION public.get_public_company_profile(company_slug text)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  logo_url text,
  website text,
  industry text,
  slogan text,
  rating numeric,
  review_count integer,
  year_established integer,
  service_areas text[],
  social_links jsonb,
  meta_title text,
  meta_description text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  -- Log the access for security monitoring
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, metadata, created_at
  ) VALUES (
    auth.uid(),
    'public_company_profile_access',
    'company',
    NULL,
    jsonb_build_object('company_slug', company_slug),
    now()
  );

  -- Only return basic profile info for verified public companies
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.logo_url,
    c.website,
    c.industry,
    c.slogan,
    c.rating,
    c.review_count,
    c.year_established,
    c.service_areas,
    c.social_links,
    c.meta_title,
    c.meta_description
  FROM companies c
  WHERE c.slug = company_slug
    AND c.public_page = true
    AND c.verified = true
    AND c.public_profile_enabled = true;
END;
$$;