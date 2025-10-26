-- Add missing cost tracking columns to wbs_items table
ALTER TABLE wbs_items 
ADD COLUMN IF NOT EXISTS committed_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS forecast_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_notes text DEFAULT '';

-- Add helpful comment
COMMENT ON COLUMN wbs_items.committed_cost IS 'Cost that has been committed/contracted';
COMMENT ON COLUMN wbs_items.paid_cost IS 'Cost that has been paid';
COMMENT ON COLUMN wbs_items.forecast_cost IS 'Forecasted final cost';
COMMENT ON COLUMN wbs_items.cost_notes IS 'Notes about costs and variations';