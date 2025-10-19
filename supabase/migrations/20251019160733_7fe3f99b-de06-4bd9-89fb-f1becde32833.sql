-- Update the bills status check constraint to include 'draft'
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_status_check;

-- Add the updated constraint with 'draft' included
ALTER TABLE bills ADD CONSTRAINT bills_status_check 
CHECK (status IN ('draft', 'submitted', 'approved', 'scheduled', 'paid', 'cancelled', 'rejected'));