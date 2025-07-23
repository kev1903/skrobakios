-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  project_id UUID NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID NULL,
  created_by UUID NOT NULL,
  due_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view tasks from their companies" 
ON public.tasks 
FOR SELECT 
USING (company_id IN (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

CREATE POLICY "Users can create tasks in their companies" 
ON public.tasks 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

CREATE POLICY "Users can update tasks in their companies" 
ON public.tasks 
FOR UPDATE 
USING (company_id IN (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

CREATE POLICY "Users can delete tasks in their companies" 
ON public.tasks 
FOR DELETE 
USING (company_id IN (
  SELECT cm.company_id
  FROM company_members cm
  WHERE cm.user_id = auth.uid() AND cm.status = 'active'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_tasks_updated_at();