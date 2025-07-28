-- Create storage policies for company logo uploads
CREATE POLICY "Company members can upload company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'company-logos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Company logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'company-logos'
);

CREATE POLICY "Company members can update company logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'company-logos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Company members can delete company logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'company-logos'
  AND auth.role() = 'authenticated'
);