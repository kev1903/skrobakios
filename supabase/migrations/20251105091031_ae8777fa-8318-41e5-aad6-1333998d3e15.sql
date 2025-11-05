-- Add url column to schedule_items table
ALTER TABLE schedule_items ADD COLUMN IF NOT EXISTS url text;