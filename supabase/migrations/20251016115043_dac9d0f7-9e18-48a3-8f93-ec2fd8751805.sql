-- First, ensure account_code is unique across the system
ALTER TABLE public.expense_accounts 
ADD CONSTRAINT unique_account_code UNIQUE (account_code);

-- Now add account_code to income_transactions
ALTER TABLE public.income_transactions 
ADD COLUMN account_code TEXT REFERENCES public.expense_accounts(account_code) ON DELETE SET NULL;

-- Add account_code to expense_transactions  
ALTER TABLE public.expense_transactions
ADD COLUMN account_code TEXT REFERENCES public.expense_accounts(account_code) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_income_transactions_account_code ON public.income_transactions(account_code);
CREATE INDEX idx_expense_transactions_account_code ON public.expense_transactions(account_code);