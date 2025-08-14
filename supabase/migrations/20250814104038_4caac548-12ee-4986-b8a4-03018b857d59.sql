-- Create documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for documents bucket
CREATE POLICY "Authenticated users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view documents from their projects" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Create processed_invoices table to store AI-extracted data
CREATE TABLE IF NOT EXISTS public.processed_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  extracted_data JSONB NOT NULL DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  bill_id UUID REFERENCES bills(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Enable RLS on processed_invoices
ALTER TABLE public.processed_invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for processed_invoices
CREATE POLICY "Users can manage processed invoices in their projects" 
ON public.processed_invoices 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create updated_at trigger for processed_invoices
CREATE TRIGGER update_processed_invoices_updated_at
  BEFORE UPDATE ON public.processed_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();