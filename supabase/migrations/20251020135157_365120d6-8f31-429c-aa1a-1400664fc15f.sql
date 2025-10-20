-- Create a function to get user emails from auth.users
-- This allows safe access to auth.users emails for company members
CREATE OR REPLACE FUNCTION public.get_company_member_emails(user_ids UUID[])
RETURNS TABLE (
  user_id UUID,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id AS user_id,
    au.email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;