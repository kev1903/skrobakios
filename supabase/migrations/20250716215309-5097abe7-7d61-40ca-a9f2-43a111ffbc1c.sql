-- Add stage column to activities table
ALTER TABLE public.activities 
ADD COLUMN stage text DEFAULT '4.0 PRELIMINARY';

-- Add comment to explain the stage column
COMMENT ON COLUMN public.activities.stage IS 'Project stage at which this activity is expected to be completed';