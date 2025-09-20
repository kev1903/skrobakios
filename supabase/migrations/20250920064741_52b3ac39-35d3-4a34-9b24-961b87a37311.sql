-- Fix the function to have proper search_path for security
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is a superadmin
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Access denied. Only superadmins can get user count.';
  END IF;
  
  -- Return the count of all users in profiles
  RETURN (SELECT COUNT(*) FROM profiles);
END;
$$;