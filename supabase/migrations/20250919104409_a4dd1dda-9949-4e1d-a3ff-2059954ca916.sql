-- Drop the incorrect RLS policy that only allows users to see their own membership
DROP POLICY IF EXISTS "company_members_select_self" ON public.company_members;

-- Create correct RLS policy: users can see all members of companies they belong to
CREATE POLICY "company_members_select_by_membership" ON public.company_members
FOR SELECT TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Also ensure users can insert company members if they're admins/owners of the company
CREATE POLICY "company_members_insert_by_admin" ON public.company_members
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.company_members cm 
    WHERE cm.company_id = company_members.company_id 
    AND cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

-- Allow company admins/owners to update member roles and status
CREATE POLICY "company_members_update_by_admin" ON public.company_members
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.company_members cm 
    WHERE cm.company_id = company_members.company_id 
    AND cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

-- Allow company admins/owners to delete members (set status to inactive)
CREATE POLICY "company_members_delete_by_admin" ON public.company_members
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.company_members cm 
    WHERE cm.company_id = company_members.company_id 
    AND cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);