-- Create storage bucket for issue attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-attachments', 'issue-attachments', false);

-- Create RLS policies for issue attachments
CREATE POLICY "Users can view issue attachments from their companies"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'issue-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT i.id::text
    FROM issues i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can upload issue attachments to their companies"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'issue-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT i.id::text
    FROM issues i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can delete issue attachments from their companies"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'issue-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT i.id::text
    FROM issues i
    JOIN projects p ON i.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);