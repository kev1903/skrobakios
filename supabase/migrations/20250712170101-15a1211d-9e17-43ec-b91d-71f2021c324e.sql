-- Ensure superadmins have full access to all core tables

-- Add superadmin access to projects table
CREATE POLICY "Superadmins can manage all projects" 
ON public.projects 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Add superadmin access to digital_objects table  
CREATE POLICY "Superadmins can manage all digital objects" 
ON public.digital_objects 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Add superadmin access to leads table
CREATE POLICY "Superadmins can manage all leads" 
ON public.leads 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Add superadmin access to tasks table
CREATE POLICY "Superadmins can manage all tasks" 
ON public.tasks 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Add superadmin access to estimates table
CREATE POLICY "Superadmins can manage all estimates" 
ON public.estimates 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Add superadmin access to time_entries table
CREATE POLICY "Superadmins can manage all time entries" 
ON public.time_entries 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Enable realtime for critical tables to ensure instant updates
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER TABLE public.company_modules REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.digital_objects REPLICA IDENTITY FULL;

-- Add tables to realtime publication for instant updates across the portal
-- Only add if not already present
DO $$
BEGIN
    -- Add companies if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'companies'
    ) THEN
        ALTER publication supabase_realtime ADD TABLE public.companies;
    END IF;
    
    -- Add company_modules if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'company_modules'
    ) THEN
        ALTER publication supabase_realtime ADD TABLE public.company_modules;
    END IF;
    
    -- Add projects if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
    ) THEN
        ALTER publication supabase_realtime ADD TABLE public.projects;
    END IF;
    
    -- Add leads if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'leads'
    ) THEN
        ALTER publication supabase_realtime ADD TABLE public.leads;
    END IF;
    
    -- Add tasks if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
    ) THEN
        ALTER publication supabase_realtime ADD TABLE public.tasks;
    END IF;
END $$;