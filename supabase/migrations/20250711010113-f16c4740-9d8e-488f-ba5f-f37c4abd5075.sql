-- Update RLS policy for digital_objects to allow authenticated users to create items
DROP POLICY IF EXISTS "Project admins and above can create digital objects" ON public.digital_objects;

-- Create new policy allowing authenticated users to create digital objects
CREATE POLICY "Authenticated users can create digital objects" 
ON public.digital_objects 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');