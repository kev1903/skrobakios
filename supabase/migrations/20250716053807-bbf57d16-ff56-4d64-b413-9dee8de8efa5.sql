-- Create project_costs table for budget and cost management
CREATE TABLE public.project_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  cost_category TEXT NOT NULL, -- e.g., 'materials', 'labor', 'equipment', 'overhead'
  budget_amount DECIMAL(12,2) DEFAULT 0,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  allocated_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'AUD',
  deposit_percentage DECIMAL(5,2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  gst_included BOOLEAN DEFAULT TRUE,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  last_modified_by UUID
);

-- Enable RLS for project_costs
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;

-- Create policies for project_costs
CREATE POLICY "Users can view project costs from their companies" 
ON public.project_costs 
FOR SELECT 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Users can create project costs in their companies" 
ON public.project_costs 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Users can update project costs in their companies" 
ON public.project_costs 
FOR UPDATE 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Users can delete project costs in their companies" 
ON public.project_costs 
FOR DELETE 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

-- Create task_dependencies table for managing task relationships
CREATE TABLE public.task_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  predecessor_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  successor_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish, start_to_finish
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for task_dependencies
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- Create policies for task_dependencies
CREATE POLICY "Users can manage task dependencies in their projects" 
ON public.task_dependencies 
FOR ALL 
USING (
  predecessor_task_id IN (
    SELECT t.id FROM tasks t 
    JOIN projects p ON t.project_id = p.id 
    JOIN company_members cm ON p.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Create quality_checks table for quality control
CREATE TABLE public.quality_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  check_type TEXT NOT NULL, -- 'compliance', 'standard', 'deliverable'
  check_name TEXT NOT NULL,
  description TEXT,
  compliance_standard TEXT, -- e.g., 'Bulleen zoning', 'AS 1428.1'
  status TEXT DEFAULT 'pending', -- 'pending', 'passed', 'failed', 'needs_review'
  findings TEXT,
  remediation_notes TEXT,
  checked_by UUID,
  checked_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for quality_checks
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;

-- Create policies for quality_checks
CREATE POLICY "Users can manage quality checks in their companies" 
ON public.quality_checks 
FOR ALL 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

-- Create AI chat interactions table for audit logging
CREATE TABLE public.ai_chat_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID,
  project_id UUID,
  command_type TEXT, -- 'task', 'cost', 'schedule', 'quality'
  command_text TEXT NOT NULL,
  response_summary TEXT,
  context_data JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for ai_chat_interactions
ALTER TABLE public.ai_chat_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_chat_interactions
CREATE POLICY "Users can view their own chat interactions" 
ON public.ai_chat_interactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat interactions" 
ON public.ai_chat_interactions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_project_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project_costs
CREATE TRIGGER update_project_costs_updated_at
  BEFORE UPDATE ON public.project_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_costs_updated_at();

-- Create trigger for task_dependencies
CREATE TRIGGER update_task_dependencies_updated_at
  BEFORE UPDATE ON public.task_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for quality_checks
CREATE TRIGGER update_quality_checks_updated_at
  BEFORE UPDATE ON public.quality_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();