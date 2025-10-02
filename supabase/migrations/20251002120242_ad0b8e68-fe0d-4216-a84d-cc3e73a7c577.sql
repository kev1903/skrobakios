-- Add variations and revised_budget columns to wbs_items table
ALTER TABLE wbs_items 
ADD COLUMN IF NOT EXISTS variations numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS revised_budget numeric DEFAULT 0;