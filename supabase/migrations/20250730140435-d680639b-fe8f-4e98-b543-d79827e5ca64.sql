-- Move all tasks back to backlog by setting their due_date to midnight (00:00:00)
-- This will automatically move them to backlog since the calendar only shows tasks with specific times

UPDATE tasks 
SET due_date = DATE_TRUNC('day', due_date) 
WHERE due_date IS NOT NULL;