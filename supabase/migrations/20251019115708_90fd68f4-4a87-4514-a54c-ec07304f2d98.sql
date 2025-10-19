-- Add milestone tracking columns to invoices table
ALTER TABLE invoices 
ADD COLUMN milestone_sequence INTEGER,
ADD COLUMN milestone_stage TEXT;

-- Add index for faster lookups when updating invoices based on milestone changes
CREATE INDEX idx_invoices_milestone ON invoices(contract_id, milestone_sequence) WHERE milestone_sequence IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN invoices.milestone_sequence IS 'Links invoice to specific milestone in contract payment_schedule array';
COMMENT ON COLUMN invoices.milestone_stage IS 'Stores the milestone stage name for quick reference';