-- Enable public read access to projects table for public BIM viewing
-- This allows unauthenticated users to view project basic info when accessing public BIM links

-- Create policy to allow anonymous users to read projects
CREATE POLICY "Allow anonymous read access to projects for public BIM viewing"
ON public.projects
FOR SELECT
TO anon
USING (true);

-- Note: This allows read-only access to project metadata for public BIM viewing
-- All other operations (INSERT, UPDATE, DELETE) still require authentication
-- Consider adding a 'public_bim_enabled' column in the future for more granular control