-- Update the RLS policy for digital_objects to allow authenticated users to update
-- This replaces the more restrictive policy that required project_admin role

DROP POLICY IF EXISTS "Project admins and above can update digital objects" ON public.digital_objects;

CREATE POLICY "Authenticated users can update digital objects" 
ON public.digital_objects 
FOR UPDATE 
USING (auth.role() = 'authenticated'::text);

-- Also update the insert policy to be consistent  
DROP POLICY IF EXISTS "Authenticated users can create digital objects" ON public.digital_objects;

CREATE POLICY "Authenticated users can create digital objects" 
ON public.digital_objects 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);