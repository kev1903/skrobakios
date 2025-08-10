-- Add drawing_type to estimate_drawings for document classification
ALTER TABLE public.estimate_drawings
ADD COLUMN IF NOT EXISTS drawing_type TEXT;