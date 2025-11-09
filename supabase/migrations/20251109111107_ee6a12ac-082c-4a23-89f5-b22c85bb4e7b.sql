-- Ensure all WBS items have a sort_order value
-- Update null sort_order values based on created_at to preserve existing order
UPDATE wbs_items
SET sort_order = subquery.row_num
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at, id) - 1 as row_num
  FROM wbs_items
  WHERE sort_order IS NULL
) as subquery
WHERE wbs_items.id = subquery.id;

-- Create index on sort_order for better query performance
CREATE INDEX IF NOT EXISTS idx_wbs_items_sort_order ON wbs_items(project_id, sort_order);

-- Create index on parent_id for hierarchy queries
CREATE INDEX IF NOT EXISTS idx_wbs_items_parent_id ON wbs_items(parent_id) WHERE parent_id IS NOT NULL;

-- Add comment to document the drag-and-drop ordering system
COMMENT ON COLUMN wbs_items.sort_order IS 'Controls display order within project. Updated via drag-and-drop. Lower values appear first.';