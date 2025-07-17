-- Add missing fields for timeline view to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS activity_name TEXT,
ADD COLUMN IF NOT EXISTS percent_complete INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assignee TEXT;

-- Update existing data to populate new fields
UPDATE tasks 
SET 
  activity_name = COALESCE(task_name, 'Unnamed Activity'),
  percent_complete = COALESCE(progress, 0),
  assignee = COALESCE(assigned_to_name, 'Unassigned')
WHERE activity_name IS NULL OR percent_complete IS NULL OR assignee IS NULL;

-- Insert sample timeline tasks for the current project if none exist
INSERT INTO tasks (
  project_id, 
  activity_name, 
  task_name,
  duration, 
  start_date, 
  end_date, 
  status, 
  percent_complete, 
  assignee,
  priority,
  description
) VALUES 
(
  '6dc04dd7-a1bb-43cc-a113-40e27f0f64d0',
  'Site Analysis',
  'Site Analysis',
  3,
  '2025-07-15',
  '2025-07-18',
  'In Progress',
  60,
  'John Smith',
  'High',
  'Comprehensive site survey and analysis'
),
(
  '6dc04dd7-a1bb-43cc-a113-40e27f0f64d0',
  'Concept Design',
  'Concept Design',
  5,
  '2025-07-19',
  '2025-07-24',
  'Pending',
  0,
  'Sarah Johnson',
  'High',
  'Initial design concepts and sketches'
),
(
  '6dc04dd7-a1bb-43cc-a113-40e27f0f64d0',
  'Planning Application',
  'Planning Application',
  10,
  '2025-07-25',
  '2025-08-06',
  'Not Started',
  0,
  'Mike Wilson',
  'Medium',
  'Prepare and submit planning application'
),
(
  '6dc04dd7-a1bb-43cc-a113-40e27f0f64d0',
  'Detailed Design',
  'Detailed Design',
  8,
  '2025-08-07',
  '2025-08-15',
  'Not Started',
  0,
  'Sarah Johnson',
  'High',
  'Detailed architectural drawings and specifications'
)
ON CONFLICT (id) DO NOTHING;