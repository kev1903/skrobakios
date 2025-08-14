-- Check if documents bucket exists, if not create it
INSERT INTO storage.buckets (id, name, public)
SELECT 'documents', 'documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents');

-- Create storage policies for documents bucket
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload documents to their projects'
  ) THEN
    CREATE POLICY "Users can upload documents to their projects"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'documents' 
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = 'contracts'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view documents from their projects'
  ) THEN
    CREATE POLICY "Users can view documents from their projects"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'documents'
      AND auth.role() = 'authenticated'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update documents in their projects'
  ) THEN
    CREATE POLICY "Users can update documents in their projects"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'documents'
      AND auth.role() = 'authenticated'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete documents from their projects'
  ) THEN
    CREATE POLICY "Users can delete documents from their projects"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'documents'
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;