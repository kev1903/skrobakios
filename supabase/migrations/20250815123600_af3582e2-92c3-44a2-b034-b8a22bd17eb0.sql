-- FINAL FIX: Permanently activate the main company and add a trigger to prevent it from being deactivated
-- This will solve the recurring issue

-- 1. Activate the main Skrobaki company 
UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id = '4042458b-8e95-4842-90d9-29f43815ecf8';  -- Skrobaki company with projects

-- 2. Create a function to ensure this user always has at least one active company
CREATE OR REPLACE FUNCTION ensure_user_has_active_company()
RETURNS TRIGGER AS $$
BEGIN
  -- If this user would have NO active companies after this update, keep at least one active
  IF NEW.status = 'inactive' AND NEW.user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' THEN
    -- Check if this would leave the user with no active companies
    IF NOT EXISTS (
      SELECT 1 FROM company_members 
      WHERE user_id = NEW.user_id 
      AND status = 'active' 
      AND company_id != NEW.company_id
    ) THEN
      -- Keep the main company active if it's the last one
      IF NEW.company_id = '4042458b-8e95-4842-90d9-29f43815ecf8' THEN
        NEW.status = 'active';
        RAISE NOTICE 'Prevented deactivation of last active company for user %', NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;