-- Create RFI comments table
CREATE TABLE public.rfi_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfi_id UUID NOT NULL,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_rfi FOREIGN KEY (rfi_id) REFERENCES public.issues(id) ON DELETE CASCADE,
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.rfi_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for RFI comments
CREATE POLICY "Company members can view RFI comments"
  ON public.rfi_comments
  FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Company members can create RFI comments"
  ON public.rfi_comments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can update their own RFI comments"
  ON public.rfi_comments
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own RFI comments"
  ON public.rfi_comments
  FOR DELETE
  USING (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_rfi_comments_rfi_id ON public.rfi_comments(rfi_id);
CREATE INDEX idx_rfi_comments_project_id ON public.rfi_comments(project_id);
CREATE INDEX idx_rfi_comments_created_at ON public.rfi_comments(created_at DESC);