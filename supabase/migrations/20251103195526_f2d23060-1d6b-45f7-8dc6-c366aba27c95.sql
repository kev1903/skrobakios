-- Create bill_notes table for storing notes on bills
CREATE TABLE IF NOT EXISTS public.bill_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bill_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for bill notes
CREATE POLICY "Users can view notes for bills in their company"
ON public.bill_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bills
    WHERE bills.id = bill_notes.bill_id
    AND bills.company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
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
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  AND created_by = auth.uid()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bill_notes_bill_id ON public.bill_notes(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_notes_created_at ON public.bill_notes(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bill_notes_updated_at
BEFORE UPDATE ON public.bill_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();