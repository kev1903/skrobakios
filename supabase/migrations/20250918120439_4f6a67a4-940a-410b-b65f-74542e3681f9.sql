-- Create the missing generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text),
          '[^a-zA-Z0-9\s\-_]', '', 'g'  -- Remove special characters except spaces, hyphens, underscores
        ),
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '\-{2,}', '-', 'g'  -- Replace multiple hyphens with single hyphen
    )
  );
END;
$$;