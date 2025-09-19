-- Fix the infinite recursion in company_members RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "company_members_select_by_membership" ON public.company_members;

-- Create a security definer function to get user's company IDs without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_company_memberships(target_user_id uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ARRAY(
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = target_user_id 
    AND cm.status = 'active'
  );
END;
$$;

-- Create the correct RLS policy using the security definer function
CREATE POLICY "company_members_select_by_membership" ON public.company_members
FOR SELECT TO authenticated
USING (
  company_id = ANY(public.get_user_company_memberships(auth.uid()))
);

-- Also fix the other policies to use the same approach
DROP POLICY IF EXISTS "company_members_insert_by_admin" ON public.company_members;
DROP POLICY IF EXISTS "company_members_update_by_admin" ON public.company_members;  
DROP POLICY IF EXISTS "company_members_delete_by_admin" ON public.company_members;

-- Create function to check if user is company admin
CREATE OR REPLACE FUNCTION public.is_user_company_admin(target_user_id uuid, target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.company_members cm 
    WHERE cm.company_id = target_company_id 
    AND cm.user_id = target_user_id 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  );
END;
$$;

-- Recreate admin policies using security definer function
CREATE POLICY "company_members_insert_by_admin" ON public.company_members
FOR INSERT TO authenticated
WITH CHECK (
  public.is_user_company_admin(auth.uid(), company_id)
);

CREATE POLICY "company_members_update_by_admin" ON public.company_members
FOR UPDATE TO authenticated
USING (
  public.is_user_company_admin(auth.uid(), company_id)
);

CREATE POLICY "company_members_delete_by_admin" ON public.company_members
FOR DELETE TO authenticated
USING (
  public.is_user_company_admin(auth.uid(), company_id)
);