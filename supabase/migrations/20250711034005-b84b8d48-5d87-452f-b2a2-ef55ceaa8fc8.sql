-- Create a more permissive RLS policy for task creation during development
-- This allows authenticated users to create tasks instead of requiring project_admin role
DROP POLICY IF EXISTS "Project admins and above can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project admins and above can update tasks" ON public.tasks;

CREATE POLICY "Authenticated users can create tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated 
USING (auth.role() = 'authenticated');