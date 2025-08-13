-- Fix security vulnerability: Remove public access to model_3d table
-- This table contains proprietary 3D building models that should only be accessible to company members

-- First, remove any overly permissive policies that allow public access
DROP POLICY IF EXISTS "Anyone can view 3D models" ON public.model_3d;
DROP POLICY IF EXISTS "Public read access to 3D models" ON public.model_3d;
DROP POLICY IF EXISTS "Authenticated users can view 3D models" ON public.model_3d;

-- Create secure RLS policies that only allow company members to access their company's 3D models
-- Users can only view 3D models from projects in their company
CREATE POLICY "Company members can view their company 3D models" 
ON public.model_3d 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
  OR project_id IS NULL AND uploaded_by = auth.uid()
);

-- Users can only insert 3D models for projects in their company
CREATE POLICY "Company members can upload 3D models" 
ON public.model_3d 
FOR INSERT 
WITH CHECK (
  (project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  ) OR project_id IS NULL)
  AND uploaded_by = auth.uid()
);

-- Users can only update 3D models they uploaded
CREATE POLICY "Users can update their uploaded 3D models" 
ON public.model_3d 
FOR UPDATE 
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- Users can only delete 3D models they uploaded
CREATE POLICY "Users can delete their uploaded 3D models" 
ON public.model_3d 
FOR DELETE 
USING (uploaded_by = auth.uid());

-- Ensure RLS is enabled on the table
ALTER TABLE public.model_3d ENABLE ROW LEVEL SECURITY;