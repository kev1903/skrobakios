-- Add assigned_to_user_id field to tasks table to store user ID reference
ALTER TABLE public.tasks 
ADD COLUMN assigned_to_user_id uuid REFERENCES auth.users(id);

-- Create an index for better performance when querying by assigned user
CREATE INDEX idx_tasks_assigned_to_user_id ON public.tasks(assigned_to_user_id);

-- Add a comment to document the field purpose
COMMENT ON COLUMN public.tasks.assigned_to_user_id IS 'References the user ID from auth.users for the assigned user';