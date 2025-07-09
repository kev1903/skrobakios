-- Create invoice allocations table to store allocation data
CREATE TABLE public.invoice_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  account_id UUID,
  project_id UUID,
  digital_object_id UUID,
  allocated_amount NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.invoice_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice allocations
CREATE POLICY "Users can view their own invoice allocations" 
ON public.invoice_allocations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoice allocations" 
ON public.invoice_allocations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice allocations" 
ON public.invoice_allocations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice allocations" 
ON public.invoice_allocations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_invoice_allocations_updated_at
BEFORE UPDATE ON public.invoice_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();