-- Update the default value for new companies
ALTER TABLE companies ALTER COLUMN business_type SET DEFAULT 'company';