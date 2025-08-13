-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  company_id UUID NOT NULL
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

-- RLS policies for contracts
CREATE POLICY "Company members can manage contracts" 
ON public.contracts 
FOR ALL 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- RLS policies for contract_versions
CREATE POLICY "Company members can manage contract versions" 
ON public.contract_versions 
FOR ALL 
USING (contract_id IN (
  SELECT c.id 
  FROM contracts c 
  JOIN company_members cm ON c.company_id = cm.company_id 
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Storage policies for contracts bucket
CREATE POLICY "Company members can view contract files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Company members can upload contract files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Company members can update contract files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Company members can delete contract files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime
ALTER TABLE public.contract_versions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contract_versions;

-- Update triggers
CREATE OR REPLACE FUNCTION public.update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_contract_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contracts_updated_at();

CREATE TRIGGER update_contract_versions_updated_at
  BEFORE UPDATE ON public.contract_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contract_versions_updated_at();