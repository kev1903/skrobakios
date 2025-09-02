-- Add predecessors column to wbs_items table for structured dependency data
ALTER TABLE public.wbs_items 
ADD COLUMN IF NOT EXISTS predecessors jsonb DEFAULT '[]'::jsonb;

-- Create index for better performance on predecessor queries
CREATE INDEX IF NOT EXISTS idx_wbs_items_predecessors ON public.wbs_items USING GIN(predecessors);

-- Create function to migrate existing linked_tasks to structured predecessors
CREATE OR REPLACE FUNCTION migrate_linked_tasks_to_predecessors()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update all rows that have linked_tasks but no predecessors
  UPDATE public.wbs_items 
  SET predecessors = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', task_id,
        'type', 'FS',
        'lag', 0
      )
    )
    FROM jsonb_array_elements_text(linked_tasks) AS task_id
    WHERE linked_tasks IS NOT NULL AND jsonb_array_length(linked_tasks) > 0
  )
  WHERE (predecessors IS NULL OR predecessors = '[]'::jsonb)
    AND linked_tasks IS NOT NULL 
    AND jsonb_array_length(linked_tasks) > 0;
END;
$$;

-- Execute the migration function to convert existing data
SELECT migrate_linked_tasks_to_predecessors();