-- Create project_document_categories table for user-defined categories per project
CREATE TABLE public.project_document_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.project_document_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view project document categories in their companies"
ON public.project_document_categories
FOR SELECT
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create project document categories in their companies"
ON public.project_document_categories
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update project document categories in their companies"
ON public.project_document_categories
FOR UPDATE
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can delete project document categories in their companies"
ON public.project_document_categories
FOR DELETE
USING (
  company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_project_document_categories_updated_at
BEFORE UPDATE ON public.project_document_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();