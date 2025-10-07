
-- Drop the existing function
DROP FUNCTION IF EXISTS delete_wbs_item_with_children(UUID);

-- Recreate with better handling for malformed parent_id data
CREATE OR REPLACE FUNCTION delete_wbs_item_with_children(item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  child_record RECORD;
BEGIN
  -- First, recursively delete all children
  -- Handle both proper UUID parent_ids and malformed jsonb parent_ids
  FOR child_record IN 
    SELECT id 
    FROM wbs_items 
    WHERE parent_id::text = item_id::text
       OR (parent_id IS NOT NULL 
           AND parent_id::text LIKE '%' || item_id::text || '%')
  LOOP
    PERFORM delete_wbs_item_with_children(child_record.id);
  END LOOP;
  
  -- Then delete the item itself
  DELETE FROM wbs_items WHERE id = item_id;
END;
$$;

-- Clean up any existing malformed parent_id data
UPDATE wbs_items
SET parent_id = NULL
WHERE parent_id IS NOT NULL 
  AND parent_id::text LIKE '%_type%'
  AND parent_id::text LIKE '%undefined%';
