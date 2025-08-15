-- Fix the fundamental issue: ensure at least one company membership is active
-- First, make sure all are inactive to start clean
UPDATE company_members 
SET status = 'inactive', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd';

-- Now activate the Skrobaki PM company (the one currently selected)
UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd'
  AND company_id = '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5';

-- Verify the change was applied
DO $$
DECLARE
    active_count integer;
BEGIN
    SELECT COUNT(*) INTO active_count 
    FROM company_members 
    WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
      AND status = 'active';
    
    IF active_count != 1 THEN
        RAISE EXCEPTION 'Expected exactly 1 active membership, found %', active_count;
    END IF;
    
    RAISE NOTICE 'Successfully activated 1 company membership';
END $$;