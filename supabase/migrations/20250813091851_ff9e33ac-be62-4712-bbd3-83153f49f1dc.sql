-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
DROP TRIGGER IF EXISTS update_contract_versions_updated_at ON public.contract_versions;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.update_contracts_updated_at();
DROP FUNCTION IF EXISTS public.update_contract_versions_updated_at();

-- Create contracts table (minimal version)
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create contract_versions table
CREATE TABLE IF NOT EXISTS public.contract_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  ai_summary_json JSONB DEFAULT '{}',
  ai_confidence NUMERIC DEFAULT 0,
  is_canonical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_name TEXT,
  file_size BIGINT
);

-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "Authenticated users can manage contracts" 
ON public.contracts 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage contract versions" 
ON public.contract_versions 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Storage policies for contracts bucket
CREATE POLICY "Authenticated users can view contract files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload contract files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update contract files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete contract files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

-- Enable realtime
ALTER TABLE public.contract_versions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contract_versions;