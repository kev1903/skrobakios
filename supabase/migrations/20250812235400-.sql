-- Fix critical security vulnerability in xero_invoices table
-- Remove the overly permissive policy that allows public access to all invoices
DROP POLICY IF EXISTS "Service can manage Xero invoices during sync" ON public.xero_invoices;

-- Create a secure policy that only allows service role to manage invoices during sync
-- This restricts access to only the service role, not all public users
CREATE POLICY "Service role can manage Xero invoices during sync" 
ON public.xero_invoices 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Also check and fix other potentially insecure Xero-related tables
-- Fix xero_contacts table if it has similar issues
DROP POLICY IF EXISTS "Service can manage Xero contacts during sync" ON public.xero_contacts;

CREATE POLICY "Service role can manage Xero contacts during sync" 
ON public.xero_contacts 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Fix xero_accounts table if it has similar issues  
DROP POLICY IF EXISTS "Service can manage Xero accounts during sync" ON public.xero_accounts;

CREATE POLICY "Service role can manage Xero accounts during sync" 
ON public.xero_accounts 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);