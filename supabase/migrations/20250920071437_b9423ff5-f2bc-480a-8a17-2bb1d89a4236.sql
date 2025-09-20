-- Create function to get all users for superadmins
CREATE OR REPLACE FUNCTION get_all_users_for_admin()
RETURNS TABLE(
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  avatar_url text,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_roles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is a superadmin
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Access denied. Only superadmins can access all users.';
  END IF;
  
  -- Return all profiles with their roles
  RETURN QUERY
  SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.company,
    p.avatar_url,
    p.status,
    p.created_at,
    p.updated_at,
    COALESCE(
      jsonb_agg(
        DISTINCT ur.role
      ) FILTER (WHERE ur.role IS NOT NULL),
      '[]'::jsonb
    ) as user_roles
  FROM profiles p
  LEFT JOIN user_roles ur ON p.user_id = ur.user_id
  GROUP BY p.user_id, p.first_name, p.last_name, p.email, p.phone, p.company, p.avatar_url, p.status, p.created_at, p.updated_at
  ORDER BY p.created_at DESC;
END;
$$;