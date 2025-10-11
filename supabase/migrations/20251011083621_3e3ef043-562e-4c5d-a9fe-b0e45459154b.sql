-- Add DELETE policy for project_documents
CREATE POLICY "Users can delete project documents they have access to"
ON project_documents
FOR DELETE
USING (
  (project_id IS NOT NULL AND is_member_of_company(
    (SELECT company_id FROM projects WHERE id = project_documents.project_id),
    auth.uid()
  ))
  OR
  (estimate_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM estimates e
    WHERE e.id = project_documents.estimate_id
    AND is_member_of_company(e.company_id, auth.uid())
  ))
);