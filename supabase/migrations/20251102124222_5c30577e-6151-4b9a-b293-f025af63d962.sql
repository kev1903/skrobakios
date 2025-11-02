-- Make the bills storage bucket public so download links work in emails
UPDATE storage.buckets 
SET public = true 
WHERE id = 'bills';