-- Fix critical security vulnerability in tasks table RLS policies

-- First, update any orphaned tasks to be associated with a company_id
-- We'll set them to the first available company to prevent data loss
UPDATE public.tasks 
SET company_id = (
  SELECT id FROM public.companies LIMIT 1
)
WHERE company_id IS NULL AND project_id IS NULL;

-- Drop the existing vulnerable SELECT policies
DROP POLICY IF EXISTS "Users can view tasks assigned to their name" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks from their companies" ON public.tasks;

-- Create secure SELECT policies that require authentication and proper company membership
CREATE POLICY "Users can view tasks assigned to them" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (
  assigned_to_user_id = auth.uid()
  OR 
  (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
  OR
  (
    project_id IS NULL 
    AND company_id IN (
      SELECT cm.company_id
      FROM company_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
);

-- Update other policies to also require authentication
DROP POLICY IF EXISTS "Users can create tasks in their companies" ON public.tasks;
CREATE POLICY "Users can create tasks in their companies" 
ON public.tasks 
FOR INSERT 
TO authenticated
WITH CHECK (
  (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
  OR 
  (
    project_id IS NULL 
    AND company_id IN (
      SELECT cm.company_id
      FROM company_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS "Users can update tasks in their companies" ON public.tasks;
CREATE POLICY "Users can update tasks in their companies" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (
  (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
  OR 
  (
    project_id IS NULL 
    AND company_id IN (
      SELECT cm.company_id
      FROM company_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
)
WITH CHECK (
  (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
  OR 
  (
    project_id IS NULL 
    AND company_id IN (
      SELECT cm.company_id
      FROM company_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS "Users can delete tasks in their companies" ON public.tasks;
CREATE POLICY "Users can delete tasks in their companies" 
ON public.tasks 
FOR DELETE 
TO authenticated
USING (
  (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
  OR 
  (
    project_id IS NULL 
    AND company_id IN (
      SELECT cm.company_id
      FROM company_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  )
);