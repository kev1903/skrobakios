-- Add contract_id column to invoices table to establish parent-child relationship
ALTER TABLE public.invoices 
ADD COLUMN contract_id uuid REFERENCES public.project_contracts(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_invoices_contract_id ON public.invoices(contract_id);

-- Add progress_percentage column to track what percentage of contract this invoice represents
ALTER TABLE public.invoices 
ADD COLUMN progress_percentage numeric DEFAULT 0;

-- Add a comment to explain the relationship
COMMENT ON COLUMN public.invoices.contract_id IS 'Foreign key to project_contracts - establishes parent-child hierarchy where contracts are parents and invoices are children';
COMMENT ON COLUMN public.invoices.progress_percentage IS 'Percentage of the contract amount this invoice represents for progress payments';