-- Drop and recreate the trigger function to ensure it uses the correct generate_slug function
DROP TRIGGER IF EXISTS profile_slug_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.ensure_unique_profile_slug();

-- Recreate the function with the correct signature
CREATE OR REPLACE FUNCTION public.ensure_unique_profile_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Generate base slug from first_name and last_name
  IF NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
    base_slug := public.generate_slug(NEW.first_name || '-' || NEW.last_name);
  ELSIF NEW.first_name IS NOT NULL THEN
    base_slug := public.generate_slug(NEW.first_name);
  ELSE
    base_slug := 'user-' || substr(NEW.user_id::text, 1, 8);
  END IF;
  
  final_slug := base_slug;
  
  -- Check if slug exists and make it unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug AND user_id != NEW.user_id) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  NEW.slug := final_slug;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER profile_slug_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.ensure_unique_profile_slug();

-- Also fix the company slug function
DROP TRIGGER IF EXISTS company_slug_trigger ON public.companies;
DROP FUNCTION IF EXISTS public.ensure_unique_company_slug();

CREATE OR REPLACE FUNCTION public.ensure_unique_company_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Only generate if slug is not provided or needs updating
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name) THEN
    base_slug := public.generate_slug(NEW.name);
    final_slug := base_slug;
    
    -- Check if slug exists and make it unique
    WHILE EXISTS (SELECT 1 FROM public.companies WHERE slug = final_slug AND id != NEW.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the company trigger
CREATE TRIGGER company_slug_trigger
    BEFORE INSERT OR UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.ensure_unique_company_slug();