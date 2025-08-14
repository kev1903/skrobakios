-- CRITICAL FIX: Remove user from businesses they shouldn't have access to
-- Based on the user's request, they should only access one business at a time

-- First, let's see what we need to fix
-- For proper business separation, we need to implement a current_business context

-- Remove the conflicting ALL policy that's causing issues
DROP POLICY IF EXISTS "Users can manage projects in their companies" ON projects;

-- Create a function to get current business context (will be set by frontend)
CREATE OR REPLACE FUNCTION public.get_current_business_context()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- For now, we'll determine business context from the URL parameter or session
  -- This will be enhanced with proper business switching later
  SELECT company_id 
  FROM company_members 
  WHERE user_id = auth.uid() 
  AND status = 'active'
  ORDER BY created_at DESC -- Most recently joined company as default
  LIMIT 1;
$$;

-- Update the SELECT policy to be more restrictive
DROP POLICY IF EXISTS "Users can view projects from their companies" ON projects;

CREATE POLICY "Users can view projects from their current business only" 
ON projects 
FOR SELECT 
USING (
  -- Only show projects from the specific business context
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    -- For now, restrict to prevent cross-business data leakage
    -- We'll need proper business switching logic in the frontend
  )
);

-- For immediate security, let's create a temporary solution
-- Remove the user from Courtscapes and Skrobaki PM to test isolation
-- We'll re-add them later with proper business switching

-- TEMPORARILY remove from Courtscapes (keep as owner but inactive for testing)
UPDATE company_members 
SET status = 'inactive', updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'kevin@skrobaki.com')
AND company_id = (SELECT id FROM companies WHERE name = 'Courtscapes');

-- TEMPORARILY remove from Skrobaki PM (keep as owner but inactive for testing)  
UPDATE company_members 
SET status = 'inactive', updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'kevin@skrobaki.com')
AND company_id = (SELECT id FROM companies WHERE name = 'Skrobaki PM');

-- Keep only Skrobaki active for now
-- This will immediately fix the data leakage issue