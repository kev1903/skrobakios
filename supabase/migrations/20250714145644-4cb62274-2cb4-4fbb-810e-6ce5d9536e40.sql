-- Update business_type enum to support Australian business types
ALTER TYPE business_type RENAME TO business_type_old;

CREATE TYPE business_type AS ENUM (
  'sole_trader',
  'partnership', 
  'company',
  'trust'
);

-- Update the companies table to use the new enum
ALTER TABLE companies 
ALTER COLUMN business_type DROP DEFAULT,
ALTER COLUMN business_type TYPE business_type USING 
  CASE 
    WHEN business_type_old::text = 'small_business' THEN 'company'::business_type
    WHEN business_type_old::text = 'individual' THEN 'sole_trader'::business_type
    WHEN business_type_old::text = 'enterprise' THEN 'company'::business_type
    WHEN business_type_old::text = 'agency' THEN 'company'::business_type
    WHEN business_type_old::text = 'freelancer' THEN 'sole_trader'::business_type
    ELSE 'company'::business_type
  END,
ALTER COLUMN business_type SET DEFAULT 'company'::business_type;

-- Drop the old enum type
DROP TYPE business_type_old;