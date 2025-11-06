-- Allow authenticated users to insert their own audit logs
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view their own audit logs
CREATE POLICY "Users can view audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);