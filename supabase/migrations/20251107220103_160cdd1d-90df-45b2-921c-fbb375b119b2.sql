-- Fix get_company_member_emails function type mismatch
-- Drop existing function
DROP FUNCTION IF EXISTS public.get_company_member_emails(uuid[]);

-- Recreate with correct return type matching auth.users.email (varchar(255))
CREATE OR REPLACE FUNCTION public.get_company_member_emails(user_ids uuid[])
RETURNS TABLE(user_id uuid, email varchar(255))
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    au.id AS user_id,
    au.email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$function$;