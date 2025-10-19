-- Create storage bucket for bill documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bill-documents', 
  'bill-documents', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for bill documents bucket
CREATE POLICY "Authenticated users can upload bill documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bill-documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can read bill documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'bill-documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update bill documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bill-documents')
WITH CHECK (bucket_id = 'bill-documents');

CREATE POLICY "Authenticated users can delete bill documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bill-documents');