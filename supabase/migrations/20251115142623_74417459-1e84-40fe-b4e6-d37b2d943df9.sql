-- Add WBS fields to estimate_line_items table
ALTER TABLE estimate_line_items 
ADD COLUMN IF NOT EXISTS wbs_number TEXT,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES estimate_line_items(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_expanded BOOLEAN DEFAULT false;

-- Add index for better performance on parent_id lookups
CREATE INDEX IF NOT EXISTS idx_estimate_line_items_parent_id ON estimate_line_items(parent_id);

-- Add index for estimate_id and sort_order for ordered queries
CREATE INDEX IF NOT EXISTS idx_estimate_line_items_estimate_sort ON estimate_line_items(estimate_id, sort_order);