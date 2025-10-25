
-- First, check if the foreign key constraint exists and drop it if it does
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invoice_items_invoice_id_fkey' 
    AND table_name = 'invoice_items'
  ) THEN
    ALTER TABLE public.invoice_items DROP CONSTRAINT invoice_items_invoice_id_fkey;
  END IF;
END $$;

-- Add the foreign key constraint with CASCADE delete
ALTER TABLE public.invoice_items
ADD CONSTRAINT invoice_items_invoice_id_fkey 
FOREIGN KEY (invoice_id) 
REFERENCES public.invoices(id) 
ON DELETE CASCADE;

-- Also clean up duplicate RLS policies on invoices table
-- Drop the generic "manage" policy as we have specific ones
DROP POLICY IF EXISTS "Users can manage invoices in their projects" ON public.invoices;
