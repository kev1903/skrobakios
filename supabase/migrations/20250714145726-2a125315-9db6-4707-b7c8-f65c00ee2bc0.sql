-- First, let's check what business_type values currently exist
SELECT DISTINCT business_type FROM companies;

-- Drop and recreate the business_type enum with Australian business types
DROP TYPE IF EXISTS business_type CASCADE;

CREATE TYPE business_type AS ENUM (
  'sole_trader',
  'partnership', 
  'company',
  'trust'
);

-- Add the business_type column back to companies table
ALTER TABLE companies 
ADD COLUMN business_type_new business_type DEFAULT 'company';

-- Update existing records to map old values to new ones
UPDATE companies SET business_type_new = 'company';

-- Drop the old column and rename the new one
ALTER TABLE companies DROP COLUMN IF EXISTS business_type;
ALTER TABLE companies RENAME COLUMN business_type_new TO business_type;