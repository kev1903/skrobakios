-- Comprehensive fix for array_length issues
-- Drop and recreate any functions that might be using incorrect syntax

-- First, let's ensure the migrate function is completely correct
DROP FUNCTION IF EXISTS public.migrate_linked_tasks_to_predecessors();

CREATE OR REPLACE FUNCTION public.migrate_linked_tasks_to_predecessors()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Let's also ensure there are no problematic triggers
-- Check if sync_wbs_task_progress trigger exists and drop/recreate it
DROP TRIGGER IF EXISTS sync_wbs_to_task_progress ON public.wbs_items;

CREATE OR REPLACE FUNCTION public.sync_wbs_task_progress()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Recreate the trigger
CREATE TRIGGER sync_wbs_to_task_progress
  BEFORE UPDATE ON public.wbs_items
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_wbs_task_progress();

-- Drop and recreate the project_scope_view to ensure it doesn't contain any problematic functions
DROP VIEW IF EXISTS public.project_scope_view CASCADE;

CREATE VIEW public.project_scope_view AS
WITH RECURSIVE scope_hierarchy AS (
  SELECT 
    id, company_id, project_id, parent_id, wbs_id, title, description, 
    assigned_to, start_date, end_date, duration, budgeted_cost, actual_cost, 
    progress, status, health, progress_status, at_risk, level, category, 
    priority, is_expanded, linked_tasks, predecessors, created_at, updated_at,
    ARRAY[wbs_id] AS path,
    0 AS depth
  FROM wbs_items
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT 
    w.id, w.company_id, w.project_id, w.parent_id, w.wbs_id, w.title, w.description,
    w.assigned_to, w.start_date, w.end_date, w.duration, w.budgeted_cost, w.actual_cost,
    w.progress, w.status, w.health, w.progress_status, w.at_risk, w.level, w.category,
    w.priority, w.is_expanded, w.linked_tasks, w.predecessors, w.created_at, w.updated_at,
    sh.path || w.wbs_id,
    sh.depth + 1
  FROM wbs_items w
  JOIN scope_hierarchy sh ON w.parent_id = sh.id
)
SELECT * FROM scope_hierarchy
ORDER BY path;