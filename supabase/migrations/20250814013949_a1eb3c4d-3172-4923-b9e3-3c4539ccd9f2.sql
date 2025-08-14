-- Check if documents bucket exists, if not create it
INSERT INTO storage.buckets (id, name, public)
SELECT 'documents', 'documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents');

-- Create storage policies for documents bucket if they don't exist
CREATE POLICY IF NOT EXISTS "Users can upload documents to their projects"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'contracts'
);

CREATE POLICY IF NOT EXISTS "Users can view documents from their projects"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can update documents in their projects"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can delete documents from their projects"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);