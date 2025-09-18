-- Recreate the generate_slug function with proper schema qualification
-- and make sure it's accessible to the trigger

DROP FUNCTION IF EXISTS public.generate_slug(text);

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle null or empty input
  IF input_text IS NULL OR TRIM(input_text) = '' THEN
    RETURN 'untitled';
  END IF;

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_slug(text) TO service_role;