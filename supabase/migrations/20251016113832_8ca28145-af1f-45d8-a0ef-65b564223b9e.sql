-- Create expense_accounts table for Chart of Accounts
CREATE TABLE IF NOT EXISTS public.expense_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  parent_account_id UUID REFERENCES public.expense_accounts(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, account_code)
);

-- Enable RLS
ALTER TABLE public.expense_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view expense accounts from their companies"
  ON public.expense_accounts
  FOR SELECT
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can create expense accounts in their companies"
  ON public.expense_accounts
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can update expense accounts in their companies"
  ON public.expense_accounts
  FOR UPDATE
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can delete expense accounts in their companies"
  ON public.expense_accounts
  FOR DELETE
  USING (
    company_id IN (
      SELECT cm.company_id 
      FROM company_members cm 
      WHERE cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_expense_accounts_company_id ON public.expense_accounts(company_id);
CREATE INDEX idx_expense_accounts_parent ON public.expense_accounts(parent_account_id);
CREATE INDEX idx_expense_accounts_type ON public.expense_accounts(account_type);