-- Add public access control for BIM viewing
-- This allows unauthenticated users to view specific projects when accessing via public BIM links

-- Add a column to track if a project allows public BIM access
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS allow_public_bim_access boolean DEFAULT false;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_public_bim 
ON public.projects(id) 
WHERE allow_public_bim_access = true;

-- Update RLS policy to allow public SELECT for projects with public BIM access enabled
CREATE POLICY "Allow public read access for projects with public BIM enabled"
ON public.projects
FOR SELECT
TO anon
USING (allow_public_bim_access = true);

-- Also allow public read access to IFC models for projects with public BIM access
CREATE POLICY "Allow public read access to IFC models for public projects"
ON public.ifc_models
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = ifc_models.project_id 
    AND projects.allow_public_bim_access = true
  )
);

-- Allow public read access to IFC comments for public projects (read-only)
CREATE POLICY "Allow public read access to IFC comments for public projects"
ON public.ifc_comments
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = ifc_comments.project_id 
    AND projects.allow_public_bim_access = true
  )
);