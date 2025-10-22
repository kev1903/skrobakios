-- Add start_date and end_date columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_date_range ON tasks(start_date, end_date);

-- Add a comment to explain the columns
COMMENT ON COLUMN tasks.start_date IS 'Task start date';
COMMENT ON COLUMN tasks.end_date IS 'Task end date (completion target)';