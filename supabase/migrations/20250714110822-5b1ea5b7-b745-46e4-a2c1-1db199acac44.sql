-- Add scheduling and dependency fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN estimated_duration INTEGER, -- in days
ADD COLUMN actual_duration INTEGER, -- in days
ADD COLUMN is_milestone BOOLEAN DEFAULT false,
ADD COLUMN is_critical_path BOOLEAN DEFAULT false;

-- Create task dependencies table
CREATE TABLE public.task_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  predecessor_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  successor_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish, start_to_finish
  lag_days INTEGER DEFAULT 0, -- delay between tasks
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(predecessor_task_id, successor_task_id)
);

-- Enable RLS on task_dependencies
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- Create policies for task_dependencies
CREATE POLICY "Users can manage task dependencies in their company projects" 
ON public.task_dependencies 
FOR ALL 
USING (
  predecessor_task_id IN (
    SELECT t.id 
    FROM tasks t 
    JOIN projects p ON t.project_id = p.id 
    JOIN company_members cm ON p.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
  AND
  successor_task_id IN (
    SELECT t.id 
    FROM tasks t 
    JOIN projects p ON t.project_id = p.id 
    JOIN company_members cm ON p.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
)
WITH CHECK (
  predecessor_task_id IN (
    SELECT t.id 
    FROM tasks t 
    JOIN projects p ON t.project_id = p.id 
    JOIN company_members cm ON p.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
  AND
  successor_task_id IN (
    SELECT t.id 
    FROM tasks t 
    JOIN projects p ON t.project_id = p.id 
    JOIN company_members cm ON p.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_task_dependencies_updated_at
  BEFORE UPDATE ON public.task_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_task_dependencies_predecessor ON public.task_dependencies(predecessor_task_id);
CREATE INDEX idx_task_dependencies_successor ON public.task_dependencies(successor_task_id);
CREATE INDEX idx_tasks_project_dates ON public.tasks(project_id, start_date, end_date);
CREATE INDEX idx_tasks_critical_path ON public.tasks(project_id, is_critical_path) WHERE is_critical_path = true;