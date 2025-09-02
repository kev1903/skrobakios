-- Remove duplicate WBS items with same wbs_id, keeping the most recently updated one
WITH ranked_items AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, wbs_id 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM wbs_items
),
duplicates_to_delete AS (
  SELECT id
  FROM ranked_items 
  WHERE rn > 1
)
DELETE FROM wbs_items 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Log the cleanup results
SELECT 
  wbs_id,
  COUNT(*) as remaining_count,
  MAX(updated_at) as latest_update
FROM wbs_items 
WHERE project_id = 'a7fbe7b1-5b50-49e3-86d3-d8a4dba422ae'
GROUP BY wbs_id
ORDER BY wbs_id;