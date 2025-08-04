-- Update the check constraint to include 'exercise' category
ALTER TABLE time_blocks DROP CONSTRAINT IF EXISTS time_blocks_category_check;

ALTER TABLE time_blocks ADD CONSTRAINT time_blocks_category_check 
CHECK (category IN ('work', 'personal', 'meeting', 'break', 'family', 'site_visit', 'church', 'rest', 'exercise'));