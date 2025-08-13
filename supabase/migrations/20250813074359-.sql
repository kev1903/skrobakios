-- Create project_contracts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for project contract access
CREATE POLICY "Users can view project contracts they have access to" 
ON public.project_contracts 
FOR SELECT 
USING (
    project_id IN (
        SELECT p.id 
        FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
);

CREATE POLICY "Users can create project contracts in their projects" 
ON public.project_contracts 
FOR INSERT 
WITH CHECK (
    project_id IN (
        SELECT p.id 
        FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
);

CREATE POLICY "Users can update project contracts they have access to" 
ON public.project_contracts 
FOR UPDATE 
USING (
    project_id IN (
        SELECT p.id 
        FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
);

CREATE POLICY "Users can delete project contracts they have access to" 
ON public.project_contracts 
FOR DELETE 
USING (
    project_id IN (
        SELECT p.id 
        FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
);

-- Create storage bucket for project contracts if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-contracts', 'project-contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for project contracts
CREATE POLICY "Users can view project contract files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-contracts');

CREATE POLICY "Users can upload project contract files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-contracts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete project contract files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-contracts' AND auth.uid() IS NOT NULL);