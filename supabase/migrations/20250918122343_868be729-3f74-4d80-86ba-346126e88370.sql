-- Update the handle_new_user_company function to properly reference the generate_slug function
CREATE OR REPLACE FUNCTION public.handle_new_user_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_company_id UUID;
  company_name TEXT;
  company_slug TEXT;
  slug_counter INTEGER := 1;
  final_slug TEXT;
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

  -- Determine company name
  company_name := COALESCE(
    NEW.raw_user_meta_data ->> 'company', 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || ' ' || 
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '') || '''s Company'
  );
  
  -- If company name is still empty or just spaces, use email
  IF TRIM(company_name) = '' OR TRIM(company_name) = '''s Company' THEN
    company_name := NEW.email || '''s Company';
  END IF;
  
  -- Generate initial slug using the fully qualified function name
  company_slug := public.generate_slug(company_name);
  final_slug := company_slug;
  
  -- Ensure slug uniqueness
  WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = final_slug) LOOP
    final_slug := company_slug || '-' || slug_counter;
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
    RAISE LOG 'Error in handle_new_user_company for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;