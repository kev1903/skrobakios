-- Fix tasks table by dropping and recreating without profiles dependency
DROP TABLE IF EXISTS public.tasks CASCADE;

-- Create tasks table for WBS to Task conversion (clean version)
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'Task',
  priority TEXT NOT NULL DEFAULT 'Medium',
  assigned_to_name TEXT,
  assigned_to_avatar TEXT,
  assigned_to_user_id UUID,  -- No foreign key to profiles
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'Not Started',
  progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  wbs_item_id UUID REFERENCES public.wbs_items(id) ON DELETE SET NULL,
  estimated_duration INTERVAL,
  is_milestone BOOLEAN DEFAULT false,
  is_critical_path BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks (no profiles dependency)
CREATE POLICY "Users can view tasks in their company projects"
  ON public.tasks
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can create tasks in their company projects"
  ON public.tasks
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can update tasks in their company projects"
  ON public.tasks
  FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can delete tasks in their company projects"
  ON public.tasks
  FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.company_members cm ON p.company_id = cm.company_id
      WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tasks_updated_at();

-- Create indexes for performance
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_wbs_item_id ON public.tasks(wbs_item_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date) WHERE due_date IS NOT NULL;