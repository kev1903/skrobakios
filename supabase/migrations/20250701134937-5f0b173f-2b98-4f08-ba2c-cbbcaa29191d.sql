
-- Create an enum for user roles
CREATE TYPE public.user_role AS ENUM ('superadmin', 'admin', 'user');

-- Create a user_roles table to manage user permissions
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1;
$$;

-- Create a function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'superadmin'
  );
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmin can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can insert roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can update roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can delete roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (public.is_superadmin(auth.uid()));

-- Create a trigger function to automatically assign superadmin role to kevin@skrobaki.com
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if this is kevin@skrobaki.com and assign superadmin role
  IF NEW.email = 'kevin@skrobaki.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin');
  ELSE
    -- Assign regular user role to all other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign roles when users sign up
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
