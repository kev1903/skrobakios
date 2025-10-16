-- Add category column to income_transactions table
ALTER TABLE income_transactions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Construction';

-- Add a comment to document the column
COMMENT ON COLUMN income_transactions.category IS 'Type of income: Consultancy, Construction, etc.';