-- Add duration column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN duration numeric;