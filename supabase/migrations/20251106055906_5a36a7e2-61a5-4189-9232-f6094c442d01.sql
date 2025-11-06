-- Update RLS policy on projects table to enforce project membership
-- Users can only see projects they are explicitly added to as project members

-- Drop existing SELECT policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='projects' 
    AND policyname='projects_select_members_secure_v3'
  ) THEN
    DROP POLICY projects_select_members_secure_v3 ON public.projects;
  END IF;
END $$;

-- Create new SELECT policy that checks project_members table
CREATE POLICY projects_select_project_members_only
ON public.projects
FOR SELECT
USING (
  -- Platform admins can see all projects
  public.is_platform_admin() 
  OR 
  -- Regular users can only see projects they are members of
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = projects.id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
  )
);

-- Create helper function to check if user is project member
CREATE OR REPLACE FUNCTION public.is_project_member_secure(target_project_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = target_project_id 
    AND pm.user_id = target_user_id 
    AND pm.status = 'active'
  );
END;
$$;