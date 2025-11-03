-- Add UPDATE policy for bill notes
CREATE POLICY "Users can update their own notes"
ON public.bill_notes
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Add DELETE policy for bill notes
CREATE POLICY "Users can delete their own notes"
ON public.bill_notes
FOR DELETE
USING (created_by = auth.uid());