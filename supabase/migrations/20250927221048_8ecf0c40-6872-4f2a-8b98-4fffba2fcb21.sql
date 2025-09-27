-- Fix any functions using incorrect array_length syntax for JSONB
-- The correct function for JSONB arrays is jsonb_array_length()

-- Check if there are any functions using array_length with jsonb and fix them
-- This is likely in the migrate_linked_tasks_to_predecessors function or a trigger

-- First, let's recreate the migrate function with correct syntax
CREATE OR REPLACE FUNCTION public.migrate_linked_tasks_to_predecessors()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Update all rows that have linked_tasks but no predecessors
  UPDATE public.wbs_items 
  SET predecessors = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', task_id,
        'type', 'FS',
        'lag', 0
      )
    )
    FROM jsonb_array_elements_text(linked_tasks) AS task_id
    WHERE linked_tasks IS NOT NULL AND jsonb_array_length(linked_tasks) > 0
  )
  WHERE (predecessors IS NULL OR predecessors = '[]'::jsonb)
    AND linked_tasks IS NOT NULL 
    AND jsonb_array_length(linked_tasks) > 0;
END;
$function$;

-- Also check and fix any triggers that might be using incorrect syntax
-- Let's also ensure the sync_wbs_task_progress function is completely correct
CREATE OR REPLACE FUNCTION public.sync_wbs_task_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if this is a task (not a phase or deliverable)
  IF NEW.category = 'Task' THEN
    -- Auto-sync progress and status
    IF NEW.status = 'Completed' AND NEW.progress != 100 THEN
      NEW.progress := 100;
    ELSIF NEW.progress = 100 AND NEW.status != 'Completed' THEN
      NEW.status := 'Completed';
    ELSIF NEW.status = 'Not Started' AND NEW.progress != 0 THEN
      NEW.progress := 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;