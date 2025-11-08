-- Enable public read access to ifc_models table for public BIM viewing
-- This allows unauthenticated users to view IFC models when accessing public BIM links

-- Create policy to allow anonymous users to read IFC models
CREATE POLICY "Allow anonymous read access to ifc_models for public BIM viewing"
ON public.ifc_models
FOR SELECT
TO anon
USING (true);

-- Note: This allows read-only access to IFC model metadata for public BIM viewing
-- All other operations (INSERT, UPDATE, DELETE) still require authentication
-- Consider adding a 'public_viewing_enabled' column to projects in the future for more granular control