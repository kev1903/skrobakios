-- Completely rewrite the handle_new_user_company trigger to be more robust
-- by inlining the slug generation logic and handling all edge cases
CREATE OR REPLACE FUNCTION public.handle_new_user_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_company_id UUID;
  company_name TEXT;
  base_slug TEXT;
  final_slug TEXT;
  slug_counter INTEGER := 1;
BEGIN
  -- Only create a company if this is a regular signup (not manual admin creation)
  -- Check if user already has company memberships
  IF EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE user_id = NEW.id
  ) THEN
    -- User is already assigned to a company, skip auto-company creation
    RETURN NEW;
  END IF;

  -- Determine company name with better fallbacks
  company_name := COALESCE(
    NEW.raw_user_meta_data ->> 'company', 
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') != '' 
           AND COALESCE(NEW.raw_user_meta_data ->> 'last_name', '') != '' 
      THEN COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || ' ' || 
           COALESCE(NEW.raw_user_meta_data ->> 'last_name', '') || '''s Company'
      ELSE NEW.email || '''s Company'
    END
  );
  
  -- Ensure we have a valid company name
  IF company_name IS NULL OR TRIM(company_name) = '' THEN
    company_name := NEW.email || '''s Company';
  END IF;
  
  -- Generate slug inline (avoiding function call issues)
  base_slug := lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          TRIM(company_name),
          '[^a-zA-Z0-9\s-]', '', 'gi'  -- Remove special characters except spaces and hyphens
        ),
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
    )
  );
  
  -- Ensure we have a valid slug
  IF base_slug IS NULL OR TRIM(base_slug) = '' OR base_slug = '-' THEN
    base_slug := 'company-' || EXTRACT(EPOCH FROM NOW())::bigint;
  END IF;
  
  final_slug := base_slug;
  
  -- Ensure slug uniqueness
  WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || slug_counter;
    slug_counter := slug_counter + 1;
  END LOOP;
  
  -- Create the company
  INSERT INTO public.companies (name, slug, created_by)
  VALUES (company_name, final_slug, NEW.id)
  RETURNING id INTO default_company_id;
  
  -- Add user as owner of their company
  INSERT INTO public.company_members (company_id, user_id, role, status)
  VALUES (default_company_id, NEW.id, 'owner', 'active');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user_company for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;