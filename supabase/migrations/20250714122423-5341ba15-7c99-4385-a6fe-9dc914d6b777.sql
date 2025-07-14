-- Create the generate_slug function if it doesn't exist
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(trim(input_text), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$;