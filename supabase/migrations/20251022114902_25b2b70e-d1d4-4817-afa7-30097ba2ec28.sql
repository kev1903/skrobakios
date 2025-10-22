-- Add sort_order column to wbs_items table for explicit ordering
ALTER TABLE public.wbs_items
ADD COLUMN sort_order INTEGER;

-- Create an index on sort_order for better query performance
CREATE INDEX idx_wbs_items_sort_order ON public.wbs_items(project_id, sort_order);

-- Populate existing items with sort_order based on creation order
WITH ranked_items AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at, wbs_id) as row_num
  FROM public.wbs_items
)
UPDATE public.wbs_items
SET sort_order = ranked_items.row_num
FROM ranked_items
WHERE wbs_items.id = ranked_items.id;