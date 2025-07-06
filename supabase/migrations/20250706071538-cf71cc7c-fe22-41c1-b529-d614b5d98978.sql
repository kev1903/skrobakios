-- Create subtasks table
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_task_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_name TEXT,
  assigned_to_avatar TEXT,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for subtasks
CREATE POLICY "Anyone can view subtasks" ON public.subtasks FOR SELECT USING (true);
CREATE POLICY "Anyone can create subtasks" ON public.subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update subtasks" ON public.subtasks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete subtasks" ON public.subtasks FOR DELETE USING (true);

-- Create task comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for task comments
CREATE POLICY "Anyone can view task comments" ON public.task_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can create task comments" ON public.task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update task comments" ON public.task_comments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete task comments" ON public.task_comments FOR DELETE USING (true);

-- Create task activity log table
CREATE TABLE public.task_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for task activity log
CREATE POLICY "Anyone can view task activity log" ON public.task_activity_log FOR SELECT USING (true);
CREATE POLICY "Anyone can create task activity log" ON public.task_activity_log FOR INSERT WITH CHECK (true);

-- Add digital_object_id to tasks table
ALTER TABLE public.tasks ADD COLUMN digital_object_id UUID;

-- Create trigger for automatic timestamp updates on subtasks
CREATE TRIGGER update_subtasks_updated_at
BEFORE UPDATE ON public.subtasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_subtasks_parent_task_id ON public.subtasks(parent_task_id);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_activity_log_task_id ON public.task_activity_log(task_id);
CREATE INDEX idx_tasks_digital_object_id ON public.tasks(digital_object_id);