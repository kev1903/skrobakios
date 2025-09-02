-- Create a function to migrate existing linked_tasks to structured predecessors format
CREATE OR REPLACE FUNCTION convert_linked_tasks_to_predecessors()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    item_record RECORD;
    predecessor_id TEXT;
    new_predecessors JSONB := '[]'::jsonb;
BEGIN
    -- Loop through all WBS items that have linked_tasks but no predecessors
    FOR item_record IN 
        SELECT id, linked_tasks 
        FROM wbs_items 
        WHERE linked_tasks IS NOT NULL 
        AND jsonb_array_length(linked_tasks) > 0
        AND (predecessors IS NULL OR predecessors = '[]'::jsonb)
    LOOP
        new_predecessors := '[]'::jsonb;
        
        -- Convert each linked task ID to structured predecessor format
        FOR predecessor_id IN 
            SELECT jsonb_array_elements_text(item_record.linked_tasks)
        LOOP
            new_predecessors := new_predecessors || jsonb_build_array(
                jsonb_build_object(
                    'id', predecessor_id,
                    'type', 'FS',
                    'lag', 0
                )
            );
        END LOOP;
        
        -- Update the item with structured predecessors
        UPDATE wbs_items 
        SET predecessors = new_predecessors
        WHERE id = item_record.id;
        
        RAISE NOTICE 'Converted % linked tasks to structured predecessors for item %', 
            jsonb_array_length(item_record.linked_tasks), item_record.id;
    END LOOP;
    
    RAISE NOTICE 'Migration completed: converted linked_tasks to structured predecessors';
END;
$$;

-- Run the migration function
SELECT convert_linked_tasks_to_predecessors();

-- Drop the function after use
DROP FUNCTION IF EXISTS convert_linked_tasks_to_predecessors();