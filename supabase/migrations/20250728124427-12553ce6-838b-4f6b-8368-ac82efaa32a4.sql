-- Fix search path security for new task number functions
CREATE OR REPLACE FUNCTION public.generate_task_number(project_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_task_number TEXT;
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
  SELECT COALESCE(MAX(CAST(SUBSTRING(t.task_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM tasks t
  WHERE t.project_id = project_id_param 
  AND t.task_number IS NOT NULL 
  AND t.task_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  -- Generate the task number
  new_task_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_task_number;
END;
$$;

-- Fix search path security for trigger function
CREATE OR REPLACE FUNCTION public.set_task_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only set task number if it's not already set
  IF NEW.task_number IS NULL THEN
    NEW.task_number := public.generate_task_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$;