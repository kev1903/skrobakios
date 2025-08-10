-- Create project_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES public.estimates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT DEFAULT 'application/pdf',
  document_type TEXT DEFAULT 'drawing', -- 'drawing', 'specification', 'cover_sheet', etc.
  ai_summary TEXT,
  ai_confidence DECIMAL(3,2) DEFAULT 0,
  ai_rationale TEXT,
  metadata JSONB DEFAULT '{}',
  extracted_text TEXT,
  image_only BOOLEAN DEFAULT FALSE,
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for project_documents
CREATE POLICY "Users can view project documents they have access to" 
ON public.project_documents 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = auth.uid() AND pm.status = 'active'
  )
  OR 
  estimate_id IN (
    SELECT e.id FROM public.estimates e
    WHERE e.company_id IN (
      SELECT cm.company_id FROM public.company_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  )
);

CREATE POLICY "Users can insert project documents for their projects" 
ON public.project_documents 
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = auth.uid() AND pm.status = 'active'
  )
  OR 
  estimate_id IN (
    SELECT e.id FROM public.estimates e
    WHERE e.company_id IN (
      SELECT cm.company_id FROM public.company_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  )
);

CREATE POLICY "Users can update project documents they have access to" 
ON public.project_documents 
FOR UPDATE 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = auth.uid() AND pm.status = 'active'
  )
  OR 
  estimate_id IN (
    SELECT e.id FROM public.estimates e
    WHERE e.company_id IN (
      SELECT cm.company_id FROM public.company_members cm
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_project_documents_updated_at
BEFORE UPDATE ON public.project_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_project_documents_project_id ON public.project_documents(project_id);
CREATE INDEX idx_project_documents_estimate_id ON public.project_documents(estimate_id);
CREATE INDEX idx_project_documents_status ON public.project_documents(processing_status);