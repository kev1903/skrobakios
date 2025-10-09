-- Create tasks table for WBS to Task conversion
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'Task',
  priority TEXT NOT NULL DEFAULT 'Medium',
  assigned_to_name TEXT,
  assigned_to_avatar TEXT,
  assigned_to_user_id UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'Not Started',
  progress NUMERIC DEFAULT 0,
  wbs_item_id UUID REFERENCES public.wbs_items(id) ON DELETE SET NULL,
  estimated_duration INTERVAL,
  is_milestone BOOLEAN DEFAULT false,
  is_critical_path BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view tasks in their company projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in their company projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their company projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their company projects" ON public.tasks;

-- Create policies for tasks
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

-- Drop and recreate trigger for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tasks_updated_at();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_wbs_item_id ON public.tasks(wbs_item_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);