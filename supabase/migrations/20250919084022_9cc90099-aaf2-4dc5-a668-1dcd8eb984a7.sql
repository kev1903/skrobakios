-- Fix the search path issue by ensuring generate_slug is properly accessible
-- Create the function with public schema explicitly
DROP FUNCTION IF EXISTS public.generate_slug(text);

CREATE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN 'company-' || substr(gen_random_uuid()::text, 1, 8);
  END IF;
  
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text),
          '[^a-zA-Z0-9\s\-_]', '', 'g'  -- Remove special characters
        ),
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
    )
  );
END;
$$;

-- Test the function immediately
SELECT public.generate_slug('Test Company Name') as test_result;