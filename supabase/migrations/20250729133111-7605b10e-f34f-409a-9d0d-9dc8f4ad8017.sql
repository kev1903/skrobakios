-- Update the due_date column to support timestamp with timezone for scheduling
ALTER TABLE tasks ALTER COLUMN due_date TYPE timestamp with time zone USING due_date::timestamp with time zone;