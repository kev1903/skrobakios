-- Create table for SK_25008 design project
CREATE TABLE public.sk_25008_design (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'consultation', 'concept', 'detailed', 'review'
  status TEXT NOT NULL DEFAULT 'pending', -- 'complete', 'in-progress', 'pending', 'delayed'
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  duration_days INTEGER NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  description TEXT,
  requirements TEXT,
  compliance_notes TEXT,
  client_feedback TEXT,
  design_files JSONB DEFAULT '[]'::jsonb, -- Array of file metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id)
);

-- Enable RLS
ALTER TABLE public.sk_25008_design ENABLE ROW LEVEL SECURITY;

-- Create policies for company members
CREATE POLICY "Users can view SK_25008 tasks from their companies" 
ON public.sk_25008_design 
FOR SELECT 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Users can create SK_25008 tasks in their companies" 
ON public.sk_25008_design 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Users can update SK_25008 tasks in their companies" 
ON public.sk_25008_design 
FOR UPDATE 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

-- Create trigger for updating timestamps
CREATE TRIGGER update_sk_25008_design_updated_at
BEFORE UPDATE ON public.sk_25008_design
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial project data
INSERT INTO public.sk_25008_design (
  task_name, 
  task_type, 
  status, 
  start_date, 
  end_date, 
  duration_days, 
  progress_percentage, 
  description, 
  requirements,
  compliance_notes,
  company_id
) VALUES 
(
  'Initial Consultation',
  'consultation',
  'complete',
  '2025-07-13 10:01:00+10:00',
  '2025-07-15 20:01:00+10:00',
  2,
  100,
  'Site analysis, photos, and critical dimensions collection',
  'Complete site survey, photograph key areas, measure critical dimensions, assess existing conditions',
  'Initial site assessment completed. Ready for concept phase.',
  (SELECT id FROM companies LIMIT 1)
),
(
  'Concept Design',
  'concept',
  'pending',
  '2025-07-16 08:00:00+10:00',
  '2025-07-19 17:00:00+10:00',
  3,
  0,
  'Draft initial layouts and sketches based on consultation data',
  'Create preliminary floor plans, elevation sketches, and design concepts. Consider client requirements and site constraints.',
  'Must comply with Bulleen residential zoning: max 2 storeys, 5m front setback, 1.5m side setbacks. Height limit 8.5m.',
  (SELECT id FROM companies LIMIT 1)
),
(
  'Detailed Design',
  'detailed',
  'pending',
  '2025-07-20 08:00:00+10:00',
  '2025-07-24 17:00:00+10:00',
  4,
  0,
  'Finalize architectural and engineering plans with local compliance',
  'Complete working drawings, structural details, compliance documentation. Prepare submission-ready plans.',
  'Ensure full compliance with Bulleen Council requirements. Include energy efficiency ratings and bushfire considerations.',
  (SELECT id FROM companies LIMIT 1)
),
(
  'Review and Approval',
  'review',
  'pending',
  '2025-07-25 08:00:00+10:00',
  '2025-07-27 17:00:00+10:00',
  2,
  0,
  'Incorporate client feedback and finalize plans for submission',
  'Client review session, incorporate feedback, final revisions, prepare submission package.',
  'Final review by local architect required before council submission. Verify all Bulleen zoning compliance.',
  (SELECT id FROM companies LIMIT 1)
);

-- Create storage bucket for design files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sk-25008-design', 'sk-25008-design', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can upload SK_25008 design files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'sk-25008-design' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view SK_25008 design files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sk-25008-design' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update SK_25008 design files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'sk-25008-design' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete SK_25008 design files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'sk-25008-design' AND auth.role() = 'authenticated');