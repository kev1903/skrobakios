-- Update the generate_access_token function to use base64 instead of base64url
CREATE OR REPLACE FUNCTION public.generate_access_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64');
END;
$function$;