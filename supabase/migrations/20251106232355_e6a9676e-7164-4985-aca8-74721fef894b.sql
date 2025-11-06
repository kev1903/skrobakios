-- Create storage bucket for IFC files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ifc-models',
  'ifc-models',
  false,
  524288000, -- 500MB limit
  ARRAY['application/x-step', 'application/octet-stream', 'model/ifc']
)
ON CONFLICT (id) DO NOTHING;

-- Create table to track IFC models
CREATE TABLE IF NOT EXISTS public.ifc_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  description TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ifc_models_project_id ON public.ifc_models(project_id);
CREATE INDEX IF NOT EXISTS idx_ifc_models_company_id ON public.ifc_models(company_id);
CREATE INDEX IF NOT EXISTS idx_ifc_models_is_active ON public.ifc_models(is_active);

-- Enable RLS
ALTER TABLE public.ifc_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ifc_models table
CREATE POLICY "Users can view IFC models for their company projects"
  ON public.ifc_models
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = ifc_models.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can upload IFC models to their company projects"
  ON public.ifc_models
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = ifc_models.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can update IFC models in their company projects"
  ON public.ifc_models
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = ifc_models.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete IFC models in their company projects"
  ON public.ifc_models
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = ifc_models.company_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Storage policies for ifc-models bucket
CREATE POLICY "Users can view IFC files for their company"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'ifc-models' AND
    EXISTS (
      SELECT 1 FROM public.ifc_models im
      JOIN public.company_members cm ON im.company_id = cm.company_id
      WHERE im.file_path = storage.objects.name
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can upload IFC files to their company"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'ifc-models' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can delete IFC files from their company"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'ifc-models' AND
    EXISTS (
      SELECT 1 FROM public.ifc_models im
      JOIN public.company_members cm ON im.company_id = cm.company_id
      WHERE im.file_path = storage.objects.name
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_ifc_models_updated_at
  BEFORE UPDATE ON public.ifc_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoices_updated_at();