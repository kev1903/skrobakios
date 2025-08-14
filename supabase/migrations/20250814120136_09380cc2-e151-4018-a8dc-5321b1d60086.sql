-- Create processed_invoices table to track AI processing results
CREATE TABLE public.processed_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  extracted_data JSONB,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processed_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for processed_invoices
CREATE POLICY "Users can manage processed invoices in their projects" 
ON public.processed_invoices
FOR ALL
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_processed_invoices_updated_at
  BEFORE UPDATE ON public.processed_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_processed_invoices_project_id ON public.processed_invoices(project_id);
CREATE INDEX idx_processed_invoices_status ON public.processed_invoices(processing_status);