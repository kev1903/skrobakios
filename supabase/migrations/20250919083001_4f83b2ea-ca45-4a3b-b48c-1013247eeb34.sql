-- Create the missing generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO ''
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