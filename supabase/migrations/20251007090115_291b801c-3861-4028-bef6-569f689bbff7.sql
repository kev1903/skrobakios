-- Create a function to recursively delete WBS items and their descendants
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
  FOR child_record IN 
    SELECT id FROM wbs_items WHERE parent_id = item_id
  LOOP
    PERFORM delete_wbs_item_with_children(child_record.id);
  END LOOP;
  
  -- Then delete the item itself
  DELETE FROM wbs_items WHERE id = item_id;
END;
$$;