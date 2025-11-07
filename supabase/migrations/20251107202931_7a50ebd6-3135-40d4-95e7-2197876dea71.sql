-- Create table for IFC model comments
CREATE TABLE IF NOT EXISTS public.ifc_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  ifc_model_id UUID REFERENCES public.ifc_models(id) ON DELETE CASCADE,
  object_id TEXT,
  position JSONB,
  comment TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ifc_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view comments in their company projects"
ON public.ifc_comments
FOR SELECT
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create comments in their company projects"
ON public.ifc_comments
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
  AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own comments"
ON public.ifc_comments
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON public.ifc_comments
FOR DELETE
USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_ifc_comments_project_id ON public.ifc_comments(project_id);
CREATE INDEX idx_ifc_comments_ifc_model_id ON public.ifc_comments(ifc_model_id);
CREATE INDEX idx_ifc_comments_company_id ON public.ifc_comments(company_id);
CREATE INDEX idx_ifc_comments_created_at ON public.ifc_comments(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ifc_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ifc_comments_updated_at
BEFORE UPDATE ON public.ifc_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_ifc_comments_updated_at();