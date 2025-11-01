-- Remove 'trade' from the stakeholder category enum
-- First, we need to create a new enum without 'trade'
CREATE TYPE stakeholder_category_new AS ENUM ('client', 'subcontractor', 'supplier', 'consultant');

-- Update the column to use the new type
ALTER TABLE stakeholders 
  ALTER COLUMN category TYPE stakeholder_category_new 
  USING category::text::stakeholder_category_new;

-- Drop the old enum type
DROP TYPE IF EXISTS stakeholder_category CASCADE;

-- Rename the new type to the old name
ALTER TYPE stakeholder_category_new RENAME TO stakeholder_category;