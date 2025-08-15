-- Fix infinite recursion in company_members RLS policies
-- The issue is that policies are referencing the same table they're attached to

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Company owners can manage members" ON company_members;

-- Drop the existing function and recreate it properly
DROP FUNCTION IF EXISTS public.can_manage_company(uuid, uuid);

-- Create a security definer function to safely check company admin status
CREATE OR REPLACE FUNCTION public.can_manage_company(target_company_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_members cm
    WHERE cm.company_id = target_company_id
    AND cm.user_id = target_user_id
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  );
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Company owners can manage members" 
ON company_members 
FOR ALL 
TO authenticated
USING (can_manage_company(company_id, auth.uid()))
WITH CHECK (can_manage_company(company_id, auth.uid()));

-- Also ensure the simple SELECT policy for users viewing their own membership is correct
DROP POLICY IF EXISTS "Users can view their own membership" ON company_members;
CREATE POLICY "Users can view their own membership" 
ON company_members 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Create a policy for inserting new memberships
DROP POLICY IF EXISTS "Users can insert their own membership" ON company_members;
CREATE POLICY "Users can insert their own membership" 
ON company_members 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());