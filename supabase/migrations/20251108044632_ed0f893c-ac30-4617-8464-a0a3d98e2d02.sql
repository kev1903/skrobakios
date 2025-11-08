-- Fix public BIM access to work for BOTH authenticated and anonymous users

-- Drop the existing policy that only works for anon users
DROP POLICY IF EXISTS "Allow public read access for projects with public BIM enabled" ON public.projects;

-- Create new policy that allows anyone (authenticated or not) to view projects with public BIM
CREATE POLICY "Allow public BIM access to everyone"
ON public.projects
FOR SELECT
USING (allow_public_bim_access = true);

-- Update IFC models policy to allow both authenticated and anonymous access
DROP POLICY IF EXISTS "Allow public read access to IFC models for public projects" ON public.ifc_models;

CREATE POLICY "Allow public BIM access to IFC models"
ON public.ifc_models
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = ifc_models.project_id 
    AND projects.allow_public_bim_access = true
  )
);

-- Update IFC comments policy to allow both authenticated and anonymous access
DROP POLICY IF EXISTS "Allow public read access to comments for public projects" ON public.ifc_comments;

CREATE POLICY "Allow public BIM access to IFC comments"
ON public.ifc_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ifc_models 
    INNER JOIN public.projects ON projects.id = ifc_models.project_id
    WHERE ifc_models.id = ifc_comments.ifc_model_id 
    AND projects.allow_public_bim_access = true
  )
);