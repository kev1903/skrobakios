-- Create storage policies for avatars bucket
-- These policies allow authenticated users to manage their profile pictures

-- Policy 1: Allow authenticated users to upload to profile-avatars folder
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload profile avatars'
  ) THEN
    CREATE POLICY "Authenticated users can upload profile avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = 'profile-avatars'
    );
  END IF;
END $$;

-- Policy 2: Allow public read access to all avatars
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access to avatars'
  ) THEN
    CREATE POLICY "Public read access to avatars"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Policy 3: Allow authenticated users to update profile avatars
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update profile avatars'
  ) THEN
    CREATE POLICY "Authenticated users can update profile avatars"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = 'profile-avatars'
    );
  END IF;
END $$;

-- Policy 4: Allow authenticated users to delete profile avatars
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete profile avatars'
  ) THEN
    CREATE POLICY "Authenticated users can delete profile avatars"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = 'profile-avatars'
    );
  END IF;
END $$;