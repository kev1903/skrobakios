-- Create report containers tables
CREATE TABLE public.rfi_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.defect_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add report_id columns to existing item tables
ALTER TABLE public.rfis ADD COLUMN report_id UUID REFERENCES public.rfi_reports(id);
ALTER TABLE public.issues ADD COLUMN report_id UUID REFERENCES public.issue_reports(id);
ALTER TABLE public.defects ADD COLUMN report_id UUID REFERENCES public.defect_reports(id);

-- Enable RLS on report tables
ALTER TABLE public.rfi_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defect_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for report tables
CREATE POLICY "Users can manage RFI reports in their companies" 
ON public.rfi_reports 
FOR ALL 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

CREATE POLICY "Users can manage Issue reports in their companies" 
ON public.issue_reports 
FOR ALL 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

CREATE POLICY "Users can manage Defect reports in their companies" 
ON public.defect_reports 
FOR ALL 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Add triggers for updated_at
CREATE TRIGGER update_rfi_reports_updated_at
  BEFORE UPDATE ON public.rfi_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issue_reports_updated_at
  BEFORE UPDATE ON public.issue_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_defect_reports_updated_at
  BEFORE UPDATE ON public.defect_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();