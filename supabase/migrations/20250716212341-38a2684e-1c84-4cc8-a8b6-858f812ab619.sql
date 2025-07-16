-- Add parent_id column to activities table to enable parent-child relationships
ALTER TABLE public.activities 
ADD COLUMN parent_id uuid REFERENCES public.activities(id) ON DELETE CASCADE;

-- Add level column to track hierarchy depth
ALTER TABLE public.activities 
ADD COLUMN level integer DEFAULT 0;

-- Add is_expanded column for UI state
ALTER TABLE public.activities 
ADD COLUMN is_expanded boolean DEFAULT true;

-- Create index for better performance on parent queries
CREATE INDEX idx_activities_parent_id ON public.activities(parent_id);
CREATE INDEX idx_activities_level ON public.activities(level);