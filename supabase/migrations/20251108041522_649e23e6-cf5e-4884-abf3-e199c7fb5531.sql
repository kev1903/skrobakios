-- Enable public read access to ifc-models storage bucket for public BIM viewing
-- This allows unauthenticated users to download IFC files when accessing public BIM links

-- Create policy to allow anonymous users to read IFC model files from storage
CREATE POLICY "Allow anonymous read access to ifc-models storage for public BIM viewing"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'ifc-models');

-- Note: This allows read-only access to IFC model files for public BIM viewing
-- All other operations (INSERT, UPDATE, DELETE) still require authentication
-- Consider adding a 'public_viewing_enabled' flag to restrict which files are publicly accessible