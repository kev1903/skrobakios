
-- Create a table for projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  contract_price TEXT,
  start_date DATE,
  deadline DATE,
  status TEXT DEFAULT 'pending',
  priority TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - making it public for now since no authentication is implemented
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy that allows everyone to view projects (since no auth is implemented yet)
CREATE POLICY "Anyone can view projects" 
  ON public.projects 
  FOR SELECT 
  USING (true);

-- Create policy that allows everyone to create projects
CREATE POLICY "Anyone can create projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows everyone to update projects
CREATE POLICY "Anyone can update projects" 
  ON public.projects 
  FOR UPDATE 
  USING (true);

-- Create policy that allows everyone to delete projects
CREATE POLICY "Anyone can delete projects" 
  ON public.projects 
  FOR DELETE 
  USING (true);
