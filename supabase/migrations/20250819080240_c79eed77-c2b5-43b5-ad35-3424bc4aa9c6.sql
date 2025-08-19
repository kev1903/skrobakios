-- Create RFIs table
CREATE TABLE public.rfis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  rfi_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  location TEXT,
  created_by UUID,
  assigned_to TEXT,
  due_date DATE,
  response_required_by DATE,
  resolved_date TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]'::jsonb,
  responses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  issue_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  location TEXT,
  created_by UUID,
  assigned_to TEXT,
  due_date DATE,
  resolved_date TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Defects table
CREATE TABLE public.defects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  defect_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'fixed', 'verified', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  severity TEXT DEFAULT 'minor' CHECK (severity IN ('minor', 'major', 'critical')),
  location TEXT,
  created_by UUID,
  assigned_to TEXT,
  due_date DATE,
  fixed_date TIMESTAMP WITH TIME ZONE,
  verified_date TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequences for auto-numbering
CREATE SEQUENCE IF NOT EXISTS rfi_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS issue_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS defect_number_seq START 1;

-- Functions to generate auto numbers
CREATE OR REPLACE FUNCTION generate_rfi_number(project_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_rfi_number TEXT;
BEGIN
  -- Get project name for prefix (first 3 chars, uppercased)
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'RFI';
  END IF;
  
  -- Get the next number for this project
  SELECT COALESCE(MAX(CAST(SUBSTRING(r.rfi_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM rfis r
  WHERE r.project_id = project_id_param 
  AND r.rfi_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_rfi_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_rfi_number;
END;
$$;

CREATE OR REPLACE FUNCTION generate_issue_number(project_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_issue_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'ISS';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(i.issue_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM issues i
  WHERE i.project_id = project_id_param 
  AND i.issue_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_issue_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_issue_number;
END;
$$;

CREATE OR REPLACE FUNCTION generate_defect_number(project_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_defect_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'DEF';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(d.defect_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM defects d
  WHERE d.project_id = project_id_param 
  AND d.defect_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_defect_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_defect_number;
END;
$$;

-- Triggers to auto-generate numbers
CREATE OR REPLACE FUNCTION set_rfi_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rfi_number IS NULL THEN
    NEW.rfi_number := generate_rfi_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION set_issue_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.issue_number IS NULL THEN
    NEW.issue_number := generate_issue_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION set_defect_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.defect_number IS NULL THEN
    NEW.defect_number := generate_defect_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER set_rfi_number_trigger
  BEFORE INSERT ON public.rfis
  FOR EACH ROW
  EXECUTE FUNCTION set_rfi_number();

CREATE TRIGGER set_issue_number_trigger
  BEFORE INSERT ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION set_issue_number();

CREATE TRIGGER set_defect_number_trigger
  BEFORE INSERT ON public.defects
  FOR EACH ROW
  EXECUTE FUNCTION set_defect_number();

-- Update triggers for timestamps
CREATE TRIGGER update_rfis_updated_at
  BEFORE UPDATE ON public.rfis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_defects_updated_at
  BEFORE UPDATE ON public.defects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for RFIs
CREATE POLICY "Users can manage RFIs in their projects"
  ON public.rfis
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

-- RLS Policies for Issues
CREATE POLICY "Users can manage Issues in their projects"
  ON public.issues
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

-- RLS Policies for Defects
CREATE POLICY "Users can manage Defects in their projects"
  ON public.defects
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_rfis_project_id ON public.rfis(project_id);
CREATE INDEX idx_rfis_company_id ON public.rfis(company_id);
CREATE INDEX idx_rfis_status ON public.rfis(status);
CREATE INDEX idx_rfis_priority ON public.rfis(priority);

CREATE INDEX idx_issues_project_id ON public.issues(project_id);
CREATE INDEX idx_issues_company_id ON public.issues(company_id);
CREATE INDEX idx_issues_status ON public.issues(status);
CREATE INDEX idx_issues_priority ON public.issues(priority);

CREATE INDEX idx_defects_project_id ON public.defects(project_id);
CREATE INDEX idx_defects_company_id ON public.defects(company_id);
CREATE INDEX idx_defects_status ON public.defects(status);
CREATE INDEX idx_defects_priority ON public.defects(priority);

-- Insert sample data to match the interface
INSERT INTO public.rfis (project_id, company_id, title, description, status, priority, assigned_to, created_by, created_at) VALUES
(
  (SELECT id FROM projects LIMIT 1),
  (SELECT company_id FROM projects LIMIT 1),
  'Clarification on Foundation Details',
  'Need clarification on foundation depth requirements for the main structure',
  'open',
  'high',
  'Project Manager',
  auth.uid(),
  '2024-01-15'::date
),
(
  (SELECT id FROM projects LIMIT 1),
  (SELECT company_id FROM projects LIMIT 1),
  'Material Specifications for Steel Frame',
  'Require detailed specifications for steel frame materials and grades',
  'pending',
  'medium',
  'Site Engineer',
  auth.uid(),
  '2024-01-14'::date
),
(
  (SELECT id FROM projects LIMIT 1),
  (SELECT company_id FROM projects LIMIT 1),
  'Electrical Layout Approval',
  'Electrical layout requires approval before proceeding with installation',
  'resolved',
  'low',
  'Electrical Contractor',
  auth.uid(),
  '2024-01-10'::date
);

INSERT INTO public.issues (project_id, company_id, title, description, status, priority, assigned_to, created_by) VALUES
(
  (SELECT id FROM projects LIMIT 1),
  (SELECT company_id FROM projects LIMIT 1),
  'Concrete Pour Delay',
  'Weather conditions causing delays in concrete pour schedule',
  'open',
  'high',
  'Site Manager',
  auth.uid()
),
(
  (SELECT id FROM projects LIMIT 1),
  (SELECT company_id FROM projects LIMIT 1),
  'Material Delivery Issue',
  'Steel beams delivered do not match specifications',
  'in_progress',
  'medium',
  'Procurement Manager',
  auth.uid()
);

INSERT INTO public.defects (project_id, company_id, title, description, status, priority, severity, assigned_to, created_by) VALUES
(
  (SELECT id FROM projects LIMIT 1),
  (SELECT company_id FROM projects LIMIT 1),
  'Wall Alignment Issue',
  'Wall is not aligned properly with architectural drawings',
  'open',
  'medium',
  'major',
  'Site Supervisor',
  auth.uid()
),
(
  (SELECT id FROM projects LIMIT 1),
  (SELECT company_id FROM projects LIMIT 1),
  'Paint Finish Defect',
  'Paint finish quality does not meet specifications',
  'fixed',
  'low',
  'minor',
  'Painter',
  auth.uid()
);