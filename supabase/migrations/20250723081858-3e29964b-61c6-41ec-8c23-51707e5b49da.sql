-- Allow project_id to be NULL for tasks that aren't assigned to projects
ALTER TABLE public.tasks ALTER COLUMN project_id DROP NOT NULL;