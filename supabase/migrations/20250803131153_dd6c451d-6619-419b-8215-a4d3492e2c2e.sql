-- Create xero_invoices table to store synced Xero invoice data
CREATE TABLE IF NOT EXISTS public.xero_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xero_invoice_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL,
  sub_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'AUD',
  sync_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, xero_invoice_id)
);

-- Enable RLS
ALTER TABLE public.xero_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for xero_invoices
CREATE POLICY "Users can view their own Xero invoices" 
ON public.xero_invoices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Xero invoices" 
ON public.xero_invoices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Xero invoices" 
ON public.xero_invoices 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_xero_invoices_updated_at
BEFORE UPDATE ON public.xero_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_xero_updated_at();