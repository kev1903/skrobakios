-- Diagnose and fix the company switching issue
-- First check current status
DO $$
DECLARE
    current_active_count integer;
    user_id_var uuid := '5213f4be-54a3-4985-a88e-e460154e52fd';
    target_company_id uuid := '4042458b-8e95-4842-90d9-29f43815ecf8';
BEGIN
    -- Check current active count
    SELECT COUNT(*) INTO current_active_count 
    FROM company_members 
    WHERE user_id = user_id_var AND status = 'active';
    
    RAISE NOTICE 'Current active memberships: %', current_active_count;
    
    -- Ensure exactly one company is active (the Skrobaki main company)
    UPDATE company_members 
    SET status = 'inactive', updated_at = now()
    WHERE user_id = user_id_var;
    
    -- Activate the selected company
    UPDATE company_members 
    SET status = 'active', updated_at = now()
    WHERE user_id = user_id_var 
      AND company_id = target_company_id;
    
    -- Verify the change
    SELECT COUNT(*) INTO current_active_count 
    FROM company_members 
    WHERE user_id = user_id_var AND status = 'active';
    
    IF current_active_count != 1 THEN
        RAISE EXCEPTION 'Failed to set exactly one active membership. Found: %', current_active_count;
    END IF;
    
    RAISE NOTICE 'Successfully activated Skrobaki company membership';
END $$;