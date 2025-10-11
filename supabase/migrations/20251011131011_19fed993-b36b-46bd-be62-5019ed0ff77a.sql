-- Add policy to allow superadmins to update document categories
CREATE POLICY "Superadmins can update document categories"
ON document_categories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);