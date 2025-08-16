-- Add contract_amount column to project_contracts table
ALTER TABLE public.project_contracts 
ADD COLUMN contract_amount NUMERIC(15,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.project_contracts.contract_amount IS 'The total contract amount/value extracted from the contract document';