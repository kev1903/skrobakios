-- Fix the project_scope_view by recreating it with SECURITY INVOKER option
-- This ensures it respects the querying user's RLS policies instead of bypassing them

-- Drop the existing view
DROP VIEW IF EXISTS public.project_scope_view CASCADE;

-- Recreate with SECURITY INVOKER option
CREATE VIEW public.project_scope_view
WITH (security_invoker = on)
AS
WITH RECURSIVE scope_hierarchy AS (
  -- Base case: top-level WBS items (no parent)
  SELECT 
    id,
    company_id,
    project_id,
    parent_id,
    wbs_id,
    title,
    description,
    assigned_to,
    start_date,
    end_date,
    duration,
    budgeted_cost,
    actual_cost,
    progress,
    status,
    health,
    progress_status,
    at_risk,
    level,
    category,
    priority,
    is_expanded,
    linked_tasks,
    predecessors,
    created_at,
    updated_at,
    ARRAY[wbs_id] AS path,
    0 AS depth
  FROM wbs_items
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child items
  SELECT 
    w.id,
    w.company_id,
    w.project_id,
    w.parent_id,
    w.wbs_id,
    w.title,
    w.description,
    w.assigned_to,
    w.start_date,
    w.end_date,
    w.duration,
    w.budgeted_cost,
    w.actual_cost,
    w.progress,
    w.status,
    w.health,
    w.progress_status,
    w.at_risk,
    w.level,
    w.category,
    w.priority,
    w.is_expanded,
    w.linked_tasks,
    w.predecessors,
    w.created_at,
    w.updated_at,
    sh.path || w.wbs_id,
    sh.depth + 1
  FROM wbs_items w
  JOIN scope_hierarchy sh ON w.parent_id = sh.id
)
SELECT 
  id,
  company_id,
  project_id,
  parent_id,
  wbs_id,
  title,
  description,
  assigned_to,
  start_date,
  end_date,
  duration,
  budgeted_cost,
  actual_cost,
  progress,
  status,
  health,
  progress_status,
  at_risk,
  level,
  category,
  priority,
  is_expanded,
  linked_tasks,
  predecessors,
  created_at,
  updated_at,
  path,
  depth
FROM scope_hierarchy
ORDER BY path;

-- Add RLS policy for the view to ensure proper access control
-- Users can only see WBS items from companies they're members of
CREATE POLICY "Users can view WBS hierarchy from their companies"
ON wbs_items
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

COMMENT ON VIEW public.project_scope_view IS 'Hierarchical view of WBS items with SECURITY INVOKER to respect user RLS policies';
