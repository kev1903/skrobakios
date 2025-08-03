-- Add latitude and longitude columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP WITH TIME ZONE;

-- Add index for spatial queries
CREATE INDEX IF NOT EXISTS idx_projects_coordinates ON public.projects(latitude, longitude);

-- Add a comment to explain the geocoding fields
COMMENT ON COLUMN public.projects.latitude IS 'Latitude coordinate from geocoded address';
COMMENT ON COLUMN public.projects.longitude IS 'Longitude coordinate from geocoded address';
COMMENT ON COLUMN public.projects.geocoded_at IS 'Timestamp when address was last geocoded';