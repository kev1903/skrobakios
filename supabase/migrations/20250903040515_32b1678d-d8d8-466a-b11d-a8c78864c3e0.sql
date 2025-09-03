-- Add banner image and position fields to projects table
ALTER TABLE public.projects 
ADD COLUMN banner_image TEXT,
ADD COLUMN banner_position JSONB DEFAULT '{"x": 0, "y": 0, "scale": 1}';