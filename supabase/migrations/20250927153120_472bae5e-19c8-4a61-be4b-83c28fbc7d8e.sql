-- Fix security warnings: Set search_path for the sync function
CREATE OR REPLACE FUNCTION public.sync_wbs_task_progress()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- When task progress changes, update linked WBS item
  IF TG_TABLE_NAME = 'tasks' AND NEW.wbs_item_id IS NOT NULL THEN
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
    WHERE id = NEW.wbs_item_id;
  END IF;

  -- When WBS progress changes, update linked task
  IF TG_TABLE_NAME = 'wbs_items' AND NEW.linked_task_id IS NOT NULL THEN
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
    WHERE id = NEW.linked_task_id;
  END IF;

  RETURN NEW;
END;
$$;