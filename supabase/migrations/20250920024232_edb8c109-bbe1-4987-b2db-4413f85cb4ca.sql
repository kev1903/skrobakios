-- Fix company_members RLS policy to allow users to add themselves as owners during company creation
DROP POLICY IF EXISTS "company_members_insert_by_admin" ON company_members;

-- Allow users to insert themselves as owner when creating a company
-- Or if they're already an admin of the company
CREATE POLICY "company_members_insert_policy" ON company_members 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id AND role = 'owner') OR  -- Allow self-insertion as owner
  is_user_company_admin(auth.uid(), company_id)  -- Or existing admin can add members
);