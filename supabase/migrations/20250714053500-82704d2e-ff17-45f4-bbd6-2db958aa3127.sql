-- Add public visibility and SEO fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_profile boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

-- Add public visibility and SEO fields to companies table  
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS public_page boolean DEFAULT true;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

-- Create function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(trim(input_text), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure unique slugs for profiles
CREATE OR REPLACE FUNCTION ensure_unique_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Generate base slug from first_name and last_name
  IF NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
    base_slug := generate_slug(NEW.first_name || '-' || NEW.last_name);
  ELSIF NEW.first_name IS NOT NULL THEN
    base_slug := generate_slug(NEW.first_name);
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate profile slugs
DROP TRIGGER IF EXISTS profile_slug_trigger ON public.profiles;
CREATE TRIGGER profile_slug_trigger
  BEFORE INSERT OR UPDATE OF first_name, last_name ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION ensure_unique_profile_slug();

-- Create function to ensure unique slugs for companies (update existing)
CREATE OR REPLACE FUNCTION ensure_unique_company_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Only generate if slug is not provided or needs updating
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name) THEN
    base_slug := generate_slug(NEW.name);
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate company slugs  
DROP TRIGGER IF EXISTS company_slug_trigger ON public.companies;
CREATE TRIGGER company_slug_trigger
  BEFORE INSERT OR UPDATE OF name ON public.companies
  FOR EACH ROW EXECUTE FUNCTION ensure_unique_company_slug();

-- Add RLS policies for public access to profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (public_profile = true);

-- Add RLS policies for public access to companies
CREATE POLICY "Public companies are viewable by everyone" 
ON public.companies FOR SELECT
USING (public_page = true);

-- Create indexes for better performance on public queries
CREATE INDEX IF NOT EXISTS idx_profiles_public_slug ON public.profiles(slug) WHERE public_profile = true;
CREATE INDEX IF NOT EXISTS idx_profiles_public_search ON public.profiles(first_name, last_name) WHERE public_profile = true;
CREATE INDEX IF NOT EXISTS idx_companies_public_slug ON public.companies(slug) WHERE public_page = true;
CREATE INDEX IF NOT EXISTS idx_companies_public_search ON public.companies(name) WHERE public_page = true;