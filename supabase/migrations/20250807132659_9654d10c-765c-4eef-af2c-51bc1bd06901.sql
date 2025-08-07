-- Drop existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can delete roles" ON public.user_roles;

-- Create a security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create new policies using the security definer function
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Superadmins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role_secure(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role_secure(auth.uid(), 'superadmin'));

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.has_role_secure(uuid, public.app_role) TO authenticated;