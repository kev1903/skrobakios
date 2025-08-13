-- Fix security vulnerability: Remove public access to model_3d table
-- This table contains proprietary 3D building models that should only be accessible to company members

-- First, remove any overly permissive policies that allow public access
DROP POLICY IF EXISTS "Anyone can view 3D models" ON public.model_3d;
DROP POLICY IF EXISTS "Public read access to 3D models" ON public.model_3d;
DROP POLICY IF EXISTS "Authenticated users can view 3D models" ON public.model_3d;

-- Create secure RLS policies that only allow company members to access their company's 3D models
-- Users can only view 3D models uploaded by their company
CREATE POLICY "Company members can view their company 3D models" 
ON public.model_3d 
FOR SELECT 
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Users can only insert 3D models for their company
CREATE POLICY "Company members can upload 3D models" 
ON public.model_3d 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
  AND uploaded_by = auth.uid()
);

-- Users can only update 3D models they uploaded in their company
CREATE POLICY "Company members can update their uploaded 3D models" 
ON public.model_3d 
FOR UPDATE 
USING (
  uploaded_by = auth.uid() 
  AND company_id IN (
    SELECT cm.company_id 
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  uploaded_by = auth.uid() 
  AND company_id IN (
    SELECT cm.company_id 
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Users can only delete 3D models they uploaded in their company
CREATE POLICY "Company members can delete their uploaded 3D models" 
ON public.model_3d 
FOR DELETE 
USING (
  uploaded_by = auth.uid() 
  AND company_id IN (
    SELECT cm.company_id 
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Ensure RLS is enabled on the table
ALTER TABLE public.model_3d ENABLE ROW LEVEL SECURITY;