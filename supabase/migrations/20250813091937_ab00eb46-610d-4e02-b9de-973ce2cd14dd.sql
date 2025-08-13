-- Create contracts table first
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS for contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy for contracts
CREATE POLICY "Authenticated users can manage contracts" 
ON public.contracts 
FOR ALL 
USING (auth.role() = 'authenticated');