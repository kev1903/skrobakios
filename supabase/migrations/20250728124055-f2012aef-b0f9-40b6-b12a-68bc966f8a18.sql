-- Add task_number column to tasks table
ALTER TABLE public.tasks ADD COLUMN task_number TEXT;

-- Create a sequence for task numbers
CREATE SEQUENCE IF NOT EXISTS task_number_seq START 1;

-- Create function to generate task numbers with project prefix
CREATE OR REPLACE FUNCTION public.generate_task_number(project_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  task_number TEXT;
BEGIN
  -- Get project name/ID for prefix (first 3 chars of project name, uppercased)
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  -- If no project found or prefix is empty, use 'TSK'
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'TSK';
  END IF;
  
  -- Get the next number for this project
  SELECT COALESCE(MAX(CAST(SUBSTRING(task_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM tasks 
  WHERE project_id = project_id_param 
  AND task_number IS NOT NULL 
  AND task_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  -- Generate the task number
  task_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN task_number;
END;
$$;

-- Create trigger function to auto-assign task numbers
CREATE OR REPLACE FUNCTION public.set_task_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set task number if it's not already set
  IF NEW.task_number IS NULL THEN
    NEW.task_number := public.generate_task_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign task numbers on insert
CREATE TRIGGER set_task_number_trigger
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_task_number();

-- Update existing tasks to have task numbers
DO $$
DECLARE
  task_record RECORD;
BEGIN
  FOR task_record IN 
    SELECT id, project_id FROM tasks WHERE task_number IS NULL
  LOOP
    UPDATE tasks 
    SET task_number = public.generate_task_number(task_record.project_id)
    WHERE id = task_record.id;
  END LOOP;
END;
$$;