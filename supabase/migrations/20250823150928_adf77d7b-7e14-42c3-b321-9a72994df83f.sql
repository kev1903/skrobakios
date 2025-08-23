-- Add RLS policy for audit_logs table
CREATE POLICY "Superadmins can view audit logs"
ON public.audit_logs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'superadmin'
));

-- Also allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');