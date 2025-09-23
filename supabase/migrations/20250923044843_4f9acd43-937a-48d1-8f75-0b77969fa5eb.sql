-- Create project_links table
CREATE TABLE IF NOT EXISTS public.project_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Add foreign key constraint to projects table
  CONSTRAINT fk_project_links_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view project links from their companies" 
ON public.project_links 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create project links in their companies" 
ON public.project_links 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update project links in their companies" 
ON public.project_links 
FOR UPDATE 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can delete project links in their companies" 
ON public.project_links 
FOR DELETE 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_project_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_project_links_updated_at
BEFORE UPDATE ON public.project_links
FOR EACH ROW
EXECUTE FUNCTION public.update_project_links_updated_at();

-- Create index for better performance
CREATE INDEX idx_project_links_project_id ON public.project_links(project_id);
CREATE INDEX idx_project_links_created_at ON public.project_links(created_at DESC);