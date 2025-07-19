-- Add sort_order field to activities table for drag-and-drop ordering
ALTER TABLE public.activities 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Create a temporary function to set initial sort_order values
CREATE OR REPLACE FUNCTION set_initial_sort_order()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    activity_record RECORD;
    counter INTEGER;
BEGIN
    -- Loop through each stage and set sort_order based on created_at
    FOR activity_record IN (
        SELECT DISTINCT stage FROM public.activities WHERE stage IS NOT NULL
    ) LOOP
        counter := 100;
        
        -- Update activities in this stage with incremental sort_order
        UPDATE public.activities 
        SET sort_order = (
            SELECT row_num * 100 
            FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
                FROM public.activities 
                WHERE stage = activity_record.stage
            ) ranked 
            WHERE ranked.id = activities.id
        )
        WHERE stage = activity_record.stage;
    END LOOP;
END;
$$;

-- Execute the function to set initial values
SELECT set_initial_sort_order();

-- Drop the temporary function
DROP FUNCTION set_initial_sort_order();

-- Create index for better performance on ordering queries
CREATE INDEX idx_activities_sort_order ON public.activities(stage, sort_order);