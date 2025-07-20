-- Remove the automatic numbering system for activities

-- Drop the triggers that add numbering
DROP TRIGGER IF EXISTS trigger_update_activity_numbering_insert ON public.activities;
DROP TRIGGER IF EXISTS trigger_update_activity_numbering_update ON public.activities;  
DROP TRIGGER IF EXISTS trigger_update_activity_numbering_delete ON public.activities;

-- Drop the numbering function
DROP FUNCTION IF EXISTS public.update_activity_numbering();

-- Remove existing numbering from activity names
UPDATE public.activities 
SET name = CASE 
    -- Remove patterns like "1.1 " or "2.3 " from the beginning of names
    WHEN name ~ '^[0-9]+\.[0-9]+\s+' THEN
        REGEXP_REPLACE(name, '^[0-9]+\.[0-9]+\s+', '')
    -- Remove patterns like "1. " from the beginning of names  
    WHEN name ~ '^[0-9]+\.\s+' THEN
        REGEXP_REPLACE(name, '^[0-9]+\.\s+', '')
    ELSE name
END
WHERE name ~ '^[0-9]+\.([0-9]+\s+|\s+)' AND name != REGEXP_REPLACE(name, '^[0-9]+\.([0-9]+\s+|\s+)', '');