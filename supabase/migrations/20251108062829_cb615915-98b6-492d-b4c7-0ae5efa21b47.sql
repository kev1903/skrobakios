-- Allow unauthenticated users to view projects with public BIM access enabled
CREATE POLICY "Allow public read access for public BIM projects"
ON public.projects
FOR SELECT
TO anon
USING (allow_public_bim_access = true);