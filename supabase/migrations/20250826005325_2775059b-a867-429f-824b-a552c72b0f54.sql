-- Fix the switch_user_company function to not deactivate other memberships
CREATE OR REPLACE FUNCTION public.switch_user_company(target_user_id uuid, target_company_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  -- Only activate the target company - don't deactivate others
  -- Users can have multiple active company memberships
  UPDATE public.company_members 
  SET status = 'active',
      updated_at = now()
  WHERE user_id = target_user_id AND company_id = target_company_id;

  RETURN json_build_object('success', true, 'company_id', target_company_id);
END;
$$;