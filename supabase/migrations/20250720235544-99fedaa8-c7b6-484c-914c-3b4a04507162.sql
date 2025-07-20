-- Add task_type column to tasks table to classify tasks as Task or Issue
ALTER TABLE public.tasks ADD COLUMN task_type TEXT NOT NULL DEFAULT 'Task';

-- Add constraint to ensure only valid values
ALTER TABLE public.tasks ADD CONSTRAINT tasks_task_type_check CHECK (task_type IN ('Task', 'Issue'));