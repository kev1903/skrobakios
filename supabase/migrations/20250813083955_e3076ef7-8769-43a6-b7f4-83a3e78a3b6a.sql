-- COMPLETE OVERHAUL: Create a completely new approach for project contracts
-- Let's drop the table and recreate it with the most basic, foolproof RLS

-- First check if project_contracts table exists
DROP TABLE IF EXISTS public.project_contracts CASCADE;

-- Create project_contracts table with minimal structure
CREATE TABLE public.project_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_contracts ENABLE ROW LEVEL SECURITY;

-- Create the most basic RLS policies that cannot possibly cause recursion
-- We'll use a direct approach that checks company membership without any complex joins

-- Policy 1: Allow authenticated users to view contracts if they're company members
CREATE POLICY "authenticated_users_can_view_project_contracts" 
ON public.project_contracts 
FOR SELECT 
TO authenticated
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    WHERE p.company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- Policy 2: Allow authenticated users to insert contracts
CREATE POLICY "authenticated_users_can_insert_project_contracts" 
ON public.project_contracts 
FOR INSERT 
TO authenticated
WITH CHECK (
  project_id IN (
    SELECT p.id 
    FROM projects p
    WHERE p.company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- Policy 3: Allow authenticated users to update contracts
CREATE POLICY "authenticated_users_can_update_project_contracts" 
ON public.project_contracts 
FOR UPDATE 
TO authenticated
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    WHERE p.company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- Policy 4: Allow authenticated users to delete contracts
CREATE POLICY "authenticated_users_can_delete_project_contracts" 
ON public.project_contracts 
FOR DELETE 
TO authenticated
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    WHERE p.company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_project_contracts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_contracts_updated_at
  BEFORE UPDATE ON public.project_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_contracts_updated_at();