-- Create a comprehensive WBS structure table for single source of truth
-- Drop and recreate to ensure clean structure

-- First update the wbs_items table to have proper categorization
ALTER TABLE wbs_items ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('Stage', 'Component', 'Element'));
ALTER TABLE wbs_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'On Hold', 'Delayed'));
ALTER TABLE wbs_items ADD COLUMN IF NOT EXISTS health TEXT DEFAULT 'Good' CHECK (health IN ('Good', 'At Risk', 'Critical', 'Unknown'));
ALTER TABLE wbs_items ADD COLUMN IF NOT EXISTS progress_status TEXT DEFAULT 'On Track' CHECK (progress_status IN ('On Track', 'Behind', 'Ahead', 'Blocked'));
ALTER TABLE wbs_items ADD COLUMN IF NOT EXISTS at_risk BOOLEAN DEFAULT false;
ALTER TABLE wbs_items ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wbs_items_project_level ON wbs_items(project_id, level);
CREATE INDEX IF NOT EXISTS idx_wbs_items_parent_id ON wbs_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_wbs_items_category ON wbs_items(category);

-- Update existing wbs_items to have proper categorization based on level
UPDATE wbs_items SET 
  category = CASE 
    WHEN level = 0 THEN 'Stage'
    WHEN level = 1 THEN 'Component' 
    WHEN level = 2 THEN 'Element'
    ELSE 'Element'
  END,
  status = COALESCE(status, 'Not Started'),
  health = COALESCE(health, 'Good'),
  progress_status = COALESCE(progress_status, 'On Track'),
  at_risk = COALESCE(at_risk, false),
  priority = COALESCE(priority, 'Medium')
WHERE category IS NULL;

-- Create a view for easy scope access with proper hierarchy
CREATE OR REPLACE VIEW project_scope_view AS
WITH RECURSIVE scope_hierarchy AS (
  -- Root level (Stages)
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
    created_at,
    updated_at,
    ARRAY[wbs_id] as path,
    0 as depth
  FROM wbs_items 
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Child levels (Components and Elements)
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
    w.created_at,
    w.updated_at,
    sh.path || w.wbs_id,
    sh.depth + 1
  FROM wbs_items w
  INNER JOIN scope_hierarchy sh ON w.parent_id = sh.id
)
SELECT * FROM scope_hierarchy
ORDER BY path;

-- Create a function to get scope data for a project
CREATE OR REPLACE FUNCTION get_project_scope(target_project_id UUID)
RETURNS TABLE(
  id UUID,
  company_id UUID,
  project_id UUID,
  parent_id UUID,
  wbs_id TEXT,
  title TEXT,
  description TEXT,
  assigned_to TEXT,
  start_date DATE,
  end_date DATE,
  duration INTEGER,
  budgeted_cost NUMERIC,
  actual_cost NUMERIC,
  progress INTEGER,
  status TEXT,
  health TEXT,
  progress_status TEXT,
  at_risk BOOLEAN,
  level INTEGER,
  category TEXT,
  priority TEXT,
  is_expanded BOOLEAN,
  linked_tasks JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  path TEXT[],
  depth INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT * FROM project_scope_view 
  WHERE project_id = target_project_id
  ORDER BY path;
$$;