-- Remove the restrictive role check constraint to allow any job role/status
-- Since roles are now job status indicators, not access control mechanisms

-- First, let's see what the current constraint looks like and remove it
ALTER TABLE public.company_members DROP CONSTRAINT IF EXISTS company_members_role_check;

-- Add a more flexible constraint that just ensures role is not empty
ALTER TABLE public.company_members ADD CONSTRAINT company_members_role_not_empty 
  CHECK (role IS NOT NULL AND trim(role) != '');

-- Add a comment to document this change
COMMENT ON COLUMN public.company_members.role IS 'Job role/status indicator - flexible text field for job titles and roles';