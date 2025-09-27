-- Fix the view creation - PostgreSQL uses SECURITY INVOKER by default
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