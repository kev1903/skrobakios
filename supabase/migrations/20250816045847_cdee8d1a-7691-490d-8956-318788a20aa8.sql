-- Adjust trigger to AFTER UPDATE to avoid tuple-modified error and ensure at least one active company remains
-- Also keep the safe RPC for switching companies

-- Drop existing trigger to replace with AFTER UPDATE
DROP TRIGGER IF EXISTS ensure_active_company_trigger ON public.company_members;

-- Recreate the ensure_user_has_active_company function tailored for AFTER UPDATE
CREATE OR REPLACE FUNCTION public.ensure_user_has_active_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_count INTEGER;
  fallback_company_id UUID;
BEGIN
  -- Only act when a row transitioned from active -> inactive
  IF (OLD.status = 'active' AND NEW.status = 'inactive') THEN
    -- After the update, count remaining active companies for this user
    SELECT COUNT(*) INTO active_count
    FROM public.company_members
    WHERE user_id = NEW.user_id AND status = 'active';

    IF active_count = 0 THEN
      -- No active companies left for this user; choose a fallback (oldest membership)
      SELECT company_id INTO fallback_company_id
      FROM public.company_members
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT 1;

      -- If the only company is the one just deactivated, re-activate it
      IF fallback_company_id = NEW.company_id THEN
        UPDATE public.company_members
        SET status = 'active', updated_at = now()
        WHERE id = NEW.id;  -- safe: this second update will not retrigger our IF branch
        RAISE NOTICE 'Re-activated last remaining company % for user %', NEW.company_id, NEW.user_id;
      ELSIF fallback_company_id IS NOT NULL THEN
        -- Otherwise, ensure some company is active for the user
        UPDATE public.company_members
        SET status = 'active', updated_at = now()
        WHERE user_id = NEW.user_id AND company_id = fallback_company_id;
        RAISE NOTICE 'Activated fallback company % for user %', fallback_company_id, NEW.user_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL; -- AFTER triggers can return NULL
END;
$$;

-- Recreate trigger as AFTER UPDATE to avoid tuple modification conflicts
CREATE TRIGGER ensure_active_company_trigger
AFTER UPDATE ON public.company_members
FOR EACH ROW
EXECUTE FUNCTION public.ensure_user_has_active_company();

-- Keep/ensure the atomic company switching RPC exists
CREATE OR REPLACE FUNCTION public.switch_user_company(target_user_id UUID, target_company_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verify membership exists
  IF NOT EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE user_id = target_user_id AND company_id = target_company_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User is not a member of this company');
  END IF;

  -- Atomically set target company active and others inactive
  UPDATE public.company_members 
  SET status = CASE WHEN company_id = target_company_id THEN 'active' ELSE 'inactive' END,
      updated_at = now()
  WHERE user_id = target_user_id;

  RETURN json_build_object('success', true, 'company_id', target_company_id);
END;
$$;