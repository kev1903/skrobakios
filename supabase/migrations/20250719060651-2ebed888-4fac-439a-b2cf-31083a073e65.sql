-- Trigger a one-time update to generate hierarchy numbers for all existing activities
-- This will update the updated_at field which will trigger the numbering function
UPDATE activities 
SET updated_at = now() 
WHERE name !~ '^[0-9]+\.[0-9]+\s+';