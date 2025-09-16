-- Update WBS items table to support Task category and additional task-specific fields
ALTER TYPE wbs_category ADD VALUE IF NOT EXISTS 'Task';

-- Add task-specific fields to wbs_items table
ALTER TABLE public.wbs_items ADD COLUMN IF NOT EXISTS scope_link TEXT;
ALTER TABLE public.wbs_items ADD COLUMN IF NOT EXISTS time_link TEXT;  
ALTER TABLE public.wbs_items ADD COLUMN IF NOT EXISTS cost_link TEXT;
ALTER TABLE public.wbs_items ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'General';
ALTER TABLE public.wbs_items ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0;
ALTER TABLE public.wbs_items ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0;

-- Create index for better performance on task queries
CREATE INDEX IF NOT EXISTS idx_wbs_items_category ON public.wbs_items(category);
CREATE INDEX IF NOT EXISTS idx_wbs_items_task_type ON public.wbs_items(task_type);

-- Update the existing check constraint to include Task category
ALTER TABLE public.wbs_items DROP CONSTRAINT IF EXISTS wbs_items_category_check;
ALTER TABLE public.wbs_items ADD CONSTRAINT wbs_items_category_check 
CHECK (category IN ('Stage', 'Component', 'Element', 'Task'));

COMMENT ON COLUMN public.wbs_items.scope_link IS 'Link to scope documentation or requirements';
COMMENT ON COLUMN public.wbs_items.time_link IS 'Link to time tracking or scheduling information';
COMMENT ON COLUMN public.wbs_items.cost_link IS 'Link to cost tracking or budget information';
COMMENT ON COLUMN public.wbs_items.task_type IS 'Type of task (General, Design, Construction, Review, etc.)';
COMMENT ON COLUMN public.wbs_items.estimated_hours IS 'Estimated hours to complete the task';
COMMENT ON COLUMN public.wbs_items.actual_hours IS 'Actual hours spent on the task';