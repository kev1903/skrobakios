-- Create tasks table 
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create policies for tasks - users can manage tasks they created or are assigned to
CREATE POLICY "Users can view tasks assigned to them or created by them" 
ON public.tasks 
FOR SELECT 
USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update tasks assigned to them or created by them" 
ON public.tasks 
FOR UPDATE 
USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can delete tasks they created" 
ON public.tasks 
FOR DELETE 
USING (created_by = auth.uid());