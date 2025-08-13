-- Create storage bucket for project contracts
INSERT INTO storage.buckets (id, name, public) VALUES ('project-contracts', 'project-contracts', false);

-- Create project_contracts table
CREATE TABLE public.project_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for project contracts
CREATE POLICY "Project members can view contracts" 
ON public.project_contracts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = project_contracts.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.status = 'active'
  )
);

CREATE POLICY "Project members can upload contracts" 
ON public.project_contracts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = project_contracts.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.status = 'active'
  )
);

CREATE POLICY "Project members can update contracts" 
ON public.project_contracts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = project_contracts.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.status = 'active'
  )
);

CREATE POLICY "Project members can delete contracts" 
ON public.project_contracts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = project_contracts.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.status = 'active'
  )
);

-- Create storage policies for project contracts
CREATE POLICY "Project members can view contract files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'project-contracts' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.project_contracts pc
    JOIN public.project_members pm ON pc.project_id = pm.project_id
    WHERE pc.file_path = name 
    AND pm.user_id = auth.uid() 
    AND pm.status = 'active'
  )
);

CREATE POLICY "Project members can upload contract files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-contracts' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Project members can delete contract files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'project-contracts' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.project_contracts pc
    JOIN public.project_members pm ON pc.project_id = pm.project_id
    WHERE pc.file_path = name 
    AND pm.user_id = auth.uid() 
    AND pm.status = 'active'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_project_contracts_updated_at
BEFORE UPDATE ON public.project_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();