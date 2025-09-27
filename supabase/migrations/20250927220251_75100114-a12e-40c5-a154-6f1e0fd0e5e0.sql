-- Fix the sync_wbs_task_progress function to use correct field names
CREATE OR REPLACE FUNCTION public.sync_wbs_task_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When task progress changes, find and update any linked WBS items
  IF TG_TABLE_NAME = 'tasks' AND NEW.id IS NOT NULL THEN
    -- Update WBS items that have this task in their linked_tasks array
    UPDATE public.wbs_items 
    SET 
      progress = NEW.progress,
      status = CASE 
        WHEN NEW.status = 'completed' THEN 'Completed'
        WHEN NEW.status = 'in_progress' THEN 'In Progress'
        WHEN NEW.status = 'not_started' THEN 'Not Started'
        WHEN NEW.status = 'on_hold' THEN 'On Hold'
        ELSE 'Not Started'
      END,
      assigned_to = NEW.assigned_to,
      updated_at = NOW()
    WHERE NEW.id::text = ANY(linked_tasks);
  END IF;

  -- When WBS progress changes, update any linked tasks
  IF TG_TABLE_NAME = 'wbs_items' AND NEW.linked_tasks IS NOT NULL AND array_length(NEW.linked_tasks, 1) > 0 THEN
    -- Update tasks that are referenced in the linked_tasks array
    UPDATE public.tasks 
    SET 
      progress = NEW.progress,
      status = CASE 
        WHEN NEW.status = 'Completed' THEN 'completed'
        WHEN NEW.status = 'In Progress' THEN 'in_progress'
        WHEN NEW.status = 'Not Started' THEN 'not_started'
        WHEN NEW.status = 'On Hold' THEN 'on_hold'
        ELSE 'not_started'
      END,
      assigned_to = NEW.assigned_to,
      updated_at = NOW()
    WHERE id::text = ANY(NEW.linked_tasks);
  END IF;

  RETURN NEW;
END;
$function$;