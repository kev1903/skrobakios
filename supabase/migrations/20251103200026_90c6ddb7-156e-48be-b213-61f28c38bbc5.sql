-- Add foreign key constraint to bill_notes.created_by
ALTER TABLE public.bill_notes 
ADD CONSTRAINT bill_notes_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Drop and recreate the policies with corrected references
DROP POLICY IF EXISTS "Users can view notes for bills in their company" ON public.bill_notes;
DROP POLICY IF EXISTS "Users can create notes for bills in their company" ON public.bill_notes;

CREATE POLICY "Users can view notes for bills in their company"
ON public.bill_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bills
    WHERE bills.id = bill_notes.bill_id
    AND bills.company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create notes for bills in their company"
ON public.bill_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bills
    WHERE bills.id = bill_notes.bill_id
    AND bills.company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  AND created_by = auth.uid()
);