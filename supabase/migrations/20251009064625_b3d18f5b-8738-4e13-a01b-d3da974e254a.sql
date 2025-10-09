-- Create project-files storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for project-files bucket
CREATE POLICY "Company members can upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files' 
  AND (storage.foldername(name))[1] = 'project-documents'
  AND (storage.foldername(name))[2]::uuid IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Company members can view project files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] = 'project-documents'
  AND (storage.foldername(name))[2]::uuid IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Company members can delete project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] = 'project-documents'
  AND (storage.foldername(name))[2]::uuid IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);