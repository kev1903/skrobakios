-- Fix critical security vulnerability in stakeholder_contacts table
-- Remove the dangerous policy that allows RLS bypass and public access

-- Drop the insecure policy that allows bypass of authentication
DROP POLICY IF EXISTS "stakeholder_contacts_secure_access_only" ON public.stakeholder_contacts;

-- Ensure RLS is enabled on the table (should already be enabled but double-check)
ALTER TABLE public.stakeholder_contacts ENABLE ROW LEVEL SECURITY;

-- The table now relies on secure policies only:
-- 1. "safe_contacts_company_members_only" - Requires authenticated company members for SELECT
-- 2. "secure_stakeholder_contacts_*" policies - Use security definer functions for proper authorization

-- Add a comment to document the security fix
COMMENT ON TABLE public.stakeholder_contacts IS 'Contains sensitive contact information. Access restricted to authenticated company members only via RLS policies. The bypass policy was removed for security.';