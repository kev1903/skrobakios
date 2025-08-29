-- Fix Xero connections RLS security issue
-- Remove the overly permissive policy that allows any authenticated user to access all connections
DROP POLICY IF EXISTS "Only authenticated users can access Xero connections" ON public.xero_connections;

-- The existing specific policies already provide proper access control:
-- - "Users can view their own Xero connection with audit" (SELECT with user_id check)
-- - "Users can manage their own Xero connection" (INSERT with user_id check)
-- - "Users can update their own Xero connection" (UPDATE with user_id check)  
-- - "Users can delete their own Xero connection" (DELETE with user_id check)

-- Add a comment explaining the security model
COMMENT ON TABLE public.xero_connections IS 'Stores encrypted Xero financial integration tokens. Access restricted to token owners only via RLS policies.';