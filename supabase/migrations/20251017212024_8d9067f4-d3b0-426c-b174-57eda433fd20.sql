-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  client_name TEXT NOT NULL,
  client_email TEXT,
  notes TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  paid_to_date NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  contract_id UUID REFERENCES public.project_contracts(id),
  progress_percentage INTEGER DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices
CREATE POLICY "Users can view invoices for their company projects"
  ON public.invoices
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can create invoices for their company projects"
  ON public.invoices
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can update invoices for their company projects"
  ON public.invoices
  FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can delete invoices for their company projects"
  ON public.invoices
  FOR DELETE
  USING (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER update_invoices_updated_at_trigger
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoices_updated_at();