-- First, just add the new enum values
ALTER TYPE business_type ADD VALUE 'sole_trader';
ALTER TYPE business_type ADD VALUE 'partnership';
ALTER TYPE business_type ADD VALUE 'company';
ALTER TYPE business_type ADD VALUE 'trust';