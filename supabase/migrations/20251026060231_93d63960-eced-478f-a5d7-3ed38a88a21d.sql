-- Add wbs_activity_id column to bills table to link bills with WBS activities
ALTER TABLE bills 
ADD COLUMN wbs_activity_id UUID REFERENCES wbs_items(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_bills_wbs_activity_id ON bills(wbs_activity_id);

-- Add comment to document the field
COMMENT ON COLUMN bills.wbs_activity_id IS 'Links a bill to a specific WBS activity for cost reconciliation';