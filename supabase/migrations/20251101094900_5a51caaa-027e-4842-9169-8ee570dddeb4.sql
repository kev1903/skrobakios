-- Create bills storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('bills', 'bills', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own bills
CREATE POLICY "Users can upload their own bills"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own bills
CREATE POLICY "Users can view their own bills"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own bills
CREATE POLICY "Users can update their own bills"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own bills
CREATE POLICY "Users can delete their own bills"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text
);