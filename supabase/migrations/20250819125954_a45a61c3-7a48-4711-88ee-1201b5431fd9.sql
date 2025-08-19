-- Create missing QA/QC related tables

-- 1. Checklists table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.qaqc_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  checklist_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'inspection',
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  assigned_to TEXT,
  due_date DATE,
  completed_date DATE,
  items JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Quality Inspections & Tests table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.quality_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  inspection_number TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  inspector_name TEXT NOT NULL,
  scheduled_date DATE,
  completion_date DATE,
  results JSONB DEFAULT '{}'::jsonb,
  pass_fail TEXT,
  notes TEXT,
  standards_reference TEXT,
  equipment_used TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Quality Plans & ITPs table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.quality_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  company_id UUID NOT NULL,
  plan_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'itp',
  status TEXT NOT NULL DEFAULT 'draft',
  phase TEXT,
  responsible_party TEXT NOT NULL,
  approved_by TEXT,
  approval_date DATE,
  revision_number INTEGER DEFAULT 1,
  hold_points JSONB DEFAULT '[]'::jsonb,
  witness_points JSONB DEFAULT '[]'::jsonb,
  inspection_criteria JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qaqc_checklists') THEN
    ALTER TABLE public.qaqc_checklists ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage checklists in their projects" ON public.qaqc_checklists
    FOR ALL USING (
      project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quality_inspections') THEN
    ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage inspections in their projects" ON public.quality_inspections
    FOR ALL USING (
      project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quality_plans') THEN
    ALTER TABLE public.quality_plans ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage quality plans in their projects" ON public.quality_plans
    FOR ALL USING (
      project_id IN (
        SELECT p.id FROM projects p
        JOIN company_members cm ON p.company_id = cm.company_id
        WHERE cm.user_id = auth.uid() AND cm.status = 'active'
      )
    );
  END IF;
END
$$;