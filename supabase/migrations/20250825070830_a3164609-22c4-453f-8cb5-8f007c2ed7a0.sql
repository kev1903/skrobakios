-- Fix user deletion failure due to FK constraint on tasks.assigned_to_user_id
-- Change FK to ON DELETE SET NULL so auth user can be deleted even if referenced by tasks

-- 1) Drop existing FK if it exists
ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_assigned_to_user_id_fkey;

-- 2) Re-create FK referencing auth.users(id) with ON DELETE SET NULL
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_assigned_to_user_id_fkey
  FOREIGN KEY (assigned_to_user_id)
  REFERENCES auth.users (id)
  ON DELETE SET NULL;

-- 3) (Optional safety) Ensure column allows NULLs
ALTER TABLE public.tasks
  ALTER COLUMN assigned_to_user_id DROP NOT NULL;