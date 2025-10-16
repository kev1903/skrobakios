-- Create income_transactions table
CREATE TABLE IF NOT EXISTS public.income_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  client_source TEXT NOT NULL,
  project_name TEXT,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  invoice_number TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.income_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view income transactions in their companies"
  ON public.income_transactions
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create income transactions in their companies"
  ON public.income_transactions
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update income transactions in their companies"
  ON public.income_transactions
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete income transactions in their companies"
  ON public.income_transactions
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create index for performance
CREATE INDEX idx_income_transactions_company_id ON public.income_transactions(company_id);
CREATE INDEX idx_income_transactions_date ON public.income_transactions(transaction_date DESC);
CREATE INDEX idx_income_transactions_status ON public.income_transactions(status);

-- Create trigger for updated_at
CREATE TRIGGER update_income_transactions_updated_at
  BEFORE UPDATE ON public.income_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tasks_updated_at();