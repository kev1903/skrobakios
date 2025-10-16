-- Create expense_transactions table similar to income_transactions
CREATE TABLE IF NOT EXISTS public.expense_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  vendor_supplier TEXT NOT NULL,
  project_name TEXT,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Construction',
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
  invoice_number TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.expense_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view expenses from their companies"
  ON public.expense_transactions
  FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can create expenses in their companies"
  ON public.expense_transactions
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can update expenses in their companies"
  ON public.expense_transactions
  FOR UPDATE
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can delete expenses in their companies"
  ON public.expense_transactions
  FOR DELETE
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

-- Create index for performance
CREATE INDEX idx_expense_transactions_company_id ON public.expense_transactions(company_id);
CREATE INDEX idx_expense_transactions_date ON public.expense_transactions(transaction_date DESC);