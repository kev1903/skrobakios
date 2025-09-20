-- Remove digital_object_id columns from all tables to eliminate digital objects references

-- Remove digital_object_id from invoice_allocations table
ALTER TABLE invoice_allocations DROP COLUMN IF EXISTS digital_object_id;

-- Remove digital_object_id from tasks table  
ALTER TABLE tasks DROP COLUMN IF EXISTS digital_object_id;