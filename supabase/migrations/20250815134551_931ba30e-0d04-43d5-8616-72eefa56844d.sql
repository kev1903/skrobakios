-- Fix the persistent company deactivation issue

-- First, ensure we have at least one active company for the user
UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
  AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8';

-- Improve the ensure_user_has_active_company function to be more robust
CREATE OR REPLACE FUNCTION public.ensure_user_has_active_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  active_count INTEGER;
  fallback_company_id UUID;
BEGIN
  -- If this update would deactivate a company, check if user would have any active companies left
  IF NEW.status = 'inactive' AND OLD.status = 'active' THEN
    -- Count remaining active companies for this user (excluding the one being deactivated)
    SELECT COUNT(*) INTO active_count
    FROM company_members 
    WHERE user_id = NEW.user_id 
      AND status = 'active' 
      AND company_id != NEW.company_id;
    
    -- If this would leave the user with no active companies, prevent the deactivation
    IF active_count = 0 THEN
      -- Find the user's first company (usually their main company) as fallback
      SELECT company_id INTO fallback_company_id
      FROM company_members
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT 1;
      
      -- If the company being deactivated is their only company, keep it active
      IF fallback_company_id = NEW.company_id THEN
        NEW.status = 'active';
        RAISE NOTICE 'Prevented deactivation of last active company for user %', NEW.user_id;
      ELSE
        -- Activate the fallback company instead
        UPDATE company_members 
        SET status = 'active', updated_at = now()
        WHERE user_id = NEW.user_id AND company_id = fallback_company_id;
        RAISE NOTICE 'Activated fallback company % for user %', fallback_company_id, NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the missing trigger on company_members table
DROP TRIGGER IF EXISTS ensure_active_company_trigger ON company_members;
CREATE TRIGGER ensure_active_company_trigger
  BEFORE UPDATE ON company_members
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_has_active_company();

-- Create a function for safe company switching that uses a single atomic operation
CREATE OR REPLACE FUNCTION public.switch_user_company(target_user_id UUID, target_company_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result json;
BEGIN
  -- Verify the user is a member of the target company
  IF NOT EXISTS (
    SELECT 1 FROM company_members 
    WHERE user_id = target_user_id AND company_id = target_company_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User is not a member of this company');
  END IF;
  
  -- Atomically switch: deactivate all others, activate target
  UPDATE company_members 
  SET status = CASE 
    WHEN company_id = target_company_id THEN 'active'
    ELSE 'inactive'
  END,
  updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN json_build_object('success', true, 'company_id', target_company_id);
END;
$function$;