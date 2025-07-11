-- Add 'owner' role to the app_role enum
-- First, we need to add the new role to the enum
ALTER TYPE public.app_role ADD VALUE 'owner';

-- Update the get_user_role function to include proper ordering with the new owner role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'owner' THEN 2
      WHEN 'admin' THEN 3
      WHEN 'user' THEN 4
    END
  LIMIT 1
$$;

-- Update RLS policies to include owner permissions
-- Owners should have access to company-related operations like admins do

-- Add policy for owners to manage companies (similar to superadmins)
CREATE POLICY "Company owners can update all companies in their scope" 
ON public.companies 
FOR UPDATE 
USING (has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));

-- Add policy for owners to manage user roles (but not as broadly as superadmins)
CREATE POLICY "Owners can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'owner'::app_role));

-- Add policy for owners to manage company members
CREATE POLICY "Owners can manage company members across companies" 
ON public.company_members 
FOR ALL 
USING (has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'owner'::app_role));