-- Create QA/QC related tables for project quality management

-- 1. Checklists table for standardized inspections
CREATE TABLE public.qaqc_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  checklist_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'inspection', -- inspection, safety, quality, etc.
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed, archived
  created_by UUID,
  assigned_to TEXT,
  due_date DATE,
  completed_date DATE,
  items JSONB DEFAULT '[]'::jsonb, -- checklist items with status
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. RFIs (Requests for Information) table
CREATE TABLE public.rfis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  rfi_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, answered, closed
  requested_by TEXT NOT NULL,
  requested_from TEXT NOT NULL,
  due_date DATE,
  response_date DATE,
  response TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Issues/NCRs (Non-Conformance Reports) table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  issue_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ncr', -- ncr, quality_issue, safety_issue, compliance_issue
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'open', -- open, investigating, resolved, closed
  reported_by TEXT NOT NULL,
  assigned_to TEXT,
  location TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  due_date DATE,
  resolution_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Defects/Punch List table
CREATE TABLE public.defects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  defect_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'finish', -- finish, structural, mechanical, electrical, other
  severity TEXT NOT NULL DEFAULT 'minor', -- minor, major, critical
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, fixed, verified, closed
  location TEXT NOT NULL,
  room_area TEXT,
  trade_responsible TEXT,
  reported_by TEXT NOT NULL,
  assigned_to TEXT,
  due_date DATE,
  completion_date DATE,
  verification_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Quality Inspections & Tests table
CREATE TABLE public.quality_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  inspection_number TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- slump_test, waterproofing, commissioning, material_test, etc.
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, failed, passed
  inspector_name TEXT NOT NULL,
  scheduled_date DATE,
  completion_date DATE,
  results JSONB DEFAULT '{}'::jsonb, -- test results, measurements, etc.
  pass_fail TEXT, -- pass, fail, conditional
  notes TEXT,
  standards_reference TEXT, -- applicable standards/codes
  equipment_used TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Quality Plans & ITPs (Inspection & Test Plans) table
CREATE TABLE public.quality_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  plan_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'itp', -- itp, quality_plan, method_statement
  status TEXT NOT NULL DEFAULT 'draft', -- draft, approved, active, superseded
  phase TEXT, -- design, construction, testing, commissioning
  responsible_party TEXT NOT NULL,
  approved_by TEXT,
  approval_date DATE,
  revision_number INTEGER DEFAULT 1,
  hold_points JSONB DEFAULT '[]'::jsonb, -- critical hold points
  witness_points JSONB DEFAULT '[]'::jsonb, -- witness points
  inspection_criteria JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.qaqc_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables (users can manage QA/QC items in their company projects)
CREATE POLICY "Users can manage checklists in their projects" ON public.qaqc_checklists
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage RFIs in their projects" ON public.rfis
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage issues in their projects" ON public.issues
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage defects in their projects" ON public.defects
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage inspections in their projects" ON public.quality_inspections
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage quality plans in their projects" ON public.quality_plans
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create functions to generate sequential numbers for each type
CREATE OR REPLACE FUNCTION public.generate_checklist_number(project_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_checklist_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'CHK';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(c.checklist_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM qaqc_checklists c
  WHERE c.project_id = project_id_param 
  AND c.checklist_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_checklist_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_checklist_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_inspection_number(project_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_inspection_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'INS';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(qi.inspection_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM quality_inspections qi
  WHERE qi.project_id = project_id_param 
  AND qi.inspection_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_inspection_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_inspection_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_quality_plan_number(project_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_plan_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'QP';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(qp.plan_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM quality_plans qp
  WHERE qp.project_id = project_id_param 
  AND qp.plan_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_plan_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_plan_number;
END;
$$;

-- Create triggers to auto-generate numbers
CREATE OR REPLACE FUNCTION public.set_checklist_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.checklist_number IS NULL THEN
    NEW.checklist_number := generate_checklist_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_inspection_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.inspection_number IS NULL THEN
    NEW.inspection_number := generate_inspection_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_quality_plan_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.plan_number IS NULL THEN
    NEW.plan_number := generate_quality_plan_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER set_checklist_number_trigger
  BEFORE INSERT ON public.qaqc_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_checklist_number();

CREATE TRIGGER set_inspection_number_trigger
  BEFORE INSERT ON public.quality_inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_inspection_number();

CREATE TRIGGER set_quality_plan_number_trigger
  BEFORE INSERT ON public.quality_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.set_quality_plan_number();

-- Create update triggers for updated_at
CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON public.qaqc_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rfis_updated_at
  BEFORE UPDATE ON public.rfis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_defects_updated_at
  BEFORE UPDATE ON public.defects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.quality_inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quality_plans_updated_at
  BEFORE UPDATE ON public.quality_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();