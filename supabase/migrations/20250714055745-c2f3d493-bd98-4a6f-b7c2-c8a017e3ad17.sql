-- Check if portfolio-images bucket exists and create it if needed
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for portfolio images
DO $$
BEGIN
  -- Policy for anyone to view portfolio images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Portfolio images are publicly accessible'
  ) THEN
    CREATE POLICY "Portfolio images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-images');
  END IF;

  -- Policy for users to upload their own portfolio images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can upload their own portfolio images'
  ) THEN
    CREATE POLICY "Users can upload their own portfolio images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Policy for users to update their own portfolio images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can update their own portfolio images'
  ) THEN
    CREATE POLICY "Users can update their own portfolio images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Policy for users to delete their own portfolio images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can delete their own portfolio images'
  ) THEN
    CREATE POLICY "Users can delete their own portfolio images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;