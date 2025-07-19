-- Add sort_order field to activities table for drag-and-drop ordering
ALTER TABLE public.activities 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Update existing activities to have initial sort_order based on created_at
UPDATE public.activities 
SET sort_order = row_number() OVER (
  PARTITION BY stage, COALESCE(parent_id::text, 'root'), level 
  ORDER BY created_at
) * 100;

-- Create index for better performance on ordering queries
CREATE INDEX idx_activities_sort_order ON public.activities(stage, sort_order);