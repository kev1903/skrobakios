-- Add missing fields to tasks table to match existing Task type
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS task_number TEXT,
  ADD COLUMN IF NOT EXISTS duration NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0;

-- Create index on task_number
CREATE INDEX IF NOT EXISTS idx_tasks_task_number ON public.tasks(task_number);

-- Update existing records to have default values
UPDATE public.tasks 
SET 
  category = COALESCE(category, 'General'),
  task_number = COALESCE(task_number, 'TASK-' || LPAD(CAST(EXTRACT(EPOCH FROM created_at)::bigint % 100000 AS TEXT), 5, '0')),
  duration = COALESCE(duration, 0),
  actual_hours = COALESCE(actual_hours, 0),
  estimated_hours = COALESCE(estimated_hours, 0)
WHERE category IS NULL OR task_number IS NULL;