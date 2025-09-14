-- Fix security issue: Restrict public access to companies table
-- Remove the overly permissive public access policy and replace with secure alternatives

-- First, drop the problematic public access policy
DROP POLICY IF EXISTS "Authenticated users can view verified public companies" ON public.companies;

-- Create a secure public profile view function that only exposes safe data
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
SET search_path = 'public'
AS $$
BEGIN
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
  FROM public.companies c
  WHERE c.slug = company_slug
    AND c.public_page = true
    AND c.verified = true;
END;
$$;

-- Create a new restrictive policy for company access
-- Only company members, platform admins, and limited public access through the function
CREATE POLICY "Restricted company access"
ON public.companies
FOR SELECT
USING (
  -- Company members can see their companies
  is_company_member_secure(id, auth.uid()) 
  OR 
  -- Platform admins can see all companies
  is_platform_admin()
);

-- Update the companies table to add a flag for controlling public visibility
-- This gives companies more control over what's public
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS public_profile_enabled boolean DEFAULT false;

-- Add a comment to document the security change
COMMENT ON POLICY "Restricted company access" ON public.companies IS 
'Secure policy: Only company members and platform admins can access full company data. Public access is handled through the get_public_company_profile function.';

-- Update existing companies to maintain current public visibility for verified companies
UPDATE public.companies 
SET public_profile_enabled = true 
WHERE public_page = true AND verified = true;