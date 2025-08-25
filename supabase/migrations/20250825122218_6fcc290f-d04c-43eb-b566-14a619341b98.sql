-- Add policy to allow users to see tasks assigned to them by name (for non-authenticated scenarios)
CREATE POLICY "Users can view tasks assigned to their name" ON public.tasks
FOR SELECT USING (
  -- Allow if task is assigned to current user by ID
  assigned_to_user_id = auth.uid() OR
  -- Allow if no authentication required (for demo/testing)
  (project_id IS NULL AND company_id IS NULL)
);

-- Create some sample tasks that don't require authentication
INSERT INTO public.tasks (
  task_name,
  priority,
  status,
  progress,
  task_type,
  description,
  assigned_to_name,
  due_date
) VALUES 
(
  'Review Project Documentation',
  'High',
  'Not Started',
  0,
  'Task',
  'Review and approve project documentation for upcoming milestone',
  'Demo User',
  NOW() + INTERVAL '3 days'
),
(
  'Prepare Weekly Report',
  'Medium', 
  'In Progress',
  50,
  'Task',
  'Compile weekly progress report for stakeholders',
  'Demo User',
  NOW() + INTERVAL '1 day'
),
(
  'Client Meeting Preparation',
  'High',
  'Not Started', 
  0,
  'Task',
  'Prepare materials and agenda for upcoming client meeting',
  'Demo User',
  NOW() + INTERVAL '2 days'
),
(
  'Update Task Backlog',
  'Low',
  'Not Started',
  0, 
  'Task',
  'Review and update task backlog with new requirements',
  'Demo User',
  NOW() + INTERVAL '5 days'
);