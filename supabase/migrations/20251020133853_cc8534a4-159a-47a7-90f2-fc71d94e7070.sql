-- Add to_pay column to bills table to track who is responsible for paying the invoice
ALTER TABLE public.bills
ADD COLUMN to_pay TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN public.bills.to_pay IS 'Email address of the person responsible for paying this bill';