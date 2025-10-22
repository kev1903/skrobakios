-- Add subtasks column to tasks table as JSONB
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_subtasks ON tasks USING gin(subtasks);