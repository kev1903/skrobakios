-- Normalize WBS data: fix levels, parent relationships, and remove duplicates
-- This migration ensures Project Scope and Schedule show consistent data

-- First, let's create a function to calculate correct level from WBS ID
CREATE OR REPLACE FUNCTION calculate_wbs_level(wbs_id text) 
RETURNS integer AS $$
BEGIN
  IF wbs_id IS NULL OR wbs_id = '' THEN
    RETURN 0;
  END IF;
  
  -- X.0 format = level 0 (Stage)
  IF wbs_id ~ '^\d+\.0$' THEN
    RETURN 0;
  END IF;
  
  -- Count dots and subtract 1 for level
  -- X.Y = level 1 (Component)
  -- X.Y.Z = level 2 (Element)
  RETURN array_length(string_to_array(wbs_id, '.'), 1) - 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get parent WBS ID from a WBS ID
CREATE OR REPLACE FUNCTION get_parent_wbs_id(wbs_id text) 
RETURNS text AS $$
DECLARE
  parts text[];
BEGIN
  IF wbs_id IS NULL OR wbs_id = '' THEN
    RETURN NULL;
  END IF;
  
  parts := string_to_array(wbs_id, '.');
  
  -- If it's already a root level (X.0), no parent
  IF array_length(parts, 1) = 2 AND parts[2] = '0' THEN
    RETURN NULL;
  END IF;
  
  -- If it's X.Y format, parent is X.0
  IF array_length(parts, 1) = 2 THEN
    RETURN parts[1] || '.0';
  END IF;
  
  -- If it's X.Y.Z format, parent is X.Y
  IF array_length(parts, 1) = 3 THEN
    RETURN parts[1] || '.' || parts[2];
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 1: Remove duplicates keeping the most recently updated record for each wbs_id
WITH ranked_items AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, wbs_id 
      ORDER BY updated_at DESC, created_at DESC, id
    ) as rn
  FROM wbs_items
)
DELETE FROM wbs_items 
WHERE id IN (
  SELECT id FROM ranked_items WHERE rn > 1
);

-- Step 2: Update all levels based on WBS ID structure
UPDATE wbs_items 
SET level = calculate_wbs_level(wbs_id)
WHERE level != calculate_wbs_level(wbs_id) OR level IS NULL;

-- Step 3: Update category based on level
UPDATE wbs_items 
SET category = CASE 
  WHEN level = 0 THEN 'Stage'
  WHEN level = 1 THEN 'Component' 
  WHEN level = 2 THEN 'Element'
  ELSE 'Task'
END
WHERE category IS NULL OR category NOT IN ('Stage', 'Component', 'Element', 'Task');

-- Step 4: Clear all parent_id relationships first
UPDATE wbs_items SET parent_id = NULL;

-- Step 5: Set parent_id relationships based on WBS hierarchy
UPDATE wbs_items 
SET parent_id = (
  SELECT p.id 
  FROM wbs_items p 
  WHERE p.project_id = wbs_items.project_id 
    AND p.wbs_id = get_parent_wbs_id(wbs_items.wbs_id)
  LIMIT 1
)
WHERE get_parent_wbs_id(wbs_id) IS NOT NULL;

-- Step 6: Ensure is_expanded is properly set
UPDATE wbs_items 
SET is_expanded = CASE 
  WHEN level = 0 THEN true  -- Stages expanded by default
  WHEN level = 1 THEN true  -- Components expanded by default
  ELSE false                -- Elements collapsed by default
END
WHERE is_expanded IS NULL;

-- Step 7: Set default progress status and health for items that don't have them
UPDATE wbs_items 
SET 
  status = COALESCE(status, 'Not Started'),
  health = COALESCE(health, 'Good'),
  progress_status = COALESCE(progress_status, 'On Track'),
  priority = COALESCE(priority, 'Medium'),
  progress = COALESCE(progress, 0)
WHERE status IS NULL OR health IS NULL OR progress_status IS NULL OR priority IS NULL OR progress IS NULL;

-- Clean up the helper functions
DROP FUNCTION IF EXISTS calculate_wbs_level(text);
DROP FUNCTION IF EXISTS get_parent_wbs_id(text);

-- Add some helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_wbs_items_project_wbs ON wbs_items(project_id, wbs_id);
CREATE INDEX IF NOT EXISTS idx_wbs_items_parent_level ON wbs_items(parent_id, level);
CREATE INDEX IF NOT EXISTS idx_wbs_items_wbs_sorting ON wbs_items(project_id, level, wbs_id);