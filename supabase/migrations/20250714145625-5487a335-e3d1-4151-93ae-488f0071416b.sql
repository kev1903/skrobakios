-- Update the business_type enum to support Australian business structures
-- First, add the new values to the existing enum
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'sole_trader';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'partnership';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'company';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'trust';

-- Update any existing records to use the new values (optional - map old to new)
-- If you want to preserve existing data, you can map:
-- 'individual' -> 'sole_trader'
-- 'small_business' -> 'company' 
-- etc.

-- Update the default value for new companies
ALTER TABLE companies ALTER COLUMN business_type SET DEFAULT 'company';