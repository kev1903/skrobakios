-- Add company_id to xero_invoices table
ALTER TABLE xero_invoices 
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Create index for better query performance
CREATE INDEX idx_xero_invoices_company_id ON xero_invoices(company_id);

-- Migrate existing data: set company_id based on user_id
UPDATE xero_invoices xi
SET company_id = cm.company_id
FROM company_members cm
WHERE xi.user_id = cm.user_id
  AND cm.status = 'active';

-- Add company_id to invoice_allocations table
ALTER TABLE invoice_allocations
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Create index for better query performance
CREATE INDEX idx_invoice_allocations_company_id ON invoice_allocations(company_id);

-- Migrate existing data: set company_id based on user_id
UPDATE invoice_allocations ia
SET company_id = cm.company_id
FROM company_members cm
WHERE ia.user_id = cm.user_id
  AND cm.status = 'active';