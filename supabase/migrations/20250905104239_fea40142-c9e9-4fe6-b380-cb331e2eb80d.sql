-- Address remaining function search_path warnings
-- by explicitly setting search_path on remaining functions

-- 1) set_active_context
CREATE OR REPLACE FUNCTION public.set_active_context(p_context_type text, p_context_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deactivate all contexts for the user
  UPDATE public.user_contexts 
  SET is_active = false 
  WHERE user_id = auth.uid();

  -- Insert or update the new active context
  INSERT INTO public.user_contexts (user_id, context_type, context_id, is_active)
  VALUES (auth.uid(), p_context_type, p_context_id, true)
  ON CONFLICT (user_id, context_type, context_id)
  DO UPDATE SET is_active = true;

  RETURN true;
END;
$$;

-- 2) get_current_context
CREATE OR REPLACE FUNCTION public.get_current_context()
RETURNS TABLE(context_type text, context_id uuid, context_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.context_type,
    uc.context_id,
    CASE 
      WHEN uc.context_type = 'personal' THEN 'Personal Workspace'
      WHEN uc.context_type = 'company' THEN c.name
      ELSE 'Unknown Context'
    END as context_name
  FROM user_contexts uc
  LEFT JOIN companies c ON (uc.context_type = 'company' AND uc.context_id = c.id)
  WHERE uc.user_id = auth.uid() 
    AND uc.is_active = true
  LIMIT 1;
END;
$$;

-- 3) is_company_member_secure (function wasn't in the database functions output but is referenced in policies)
-- So just making sure its properly secured
DO $$
BEGIN
  -- Only recreate if it exists with insecure path
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'is_company_member_secure'
    AND (p.prosecdef = false OR pg_get_function_identity_arguments(p.oid) LIKE '%search_path%' = false)
  ) THEN
    -- Drop and recreate with security definer and explicit search_path
    DROP FUNCTION public.is_company_member_secure(uuid, uuid);
  END IF;
END $$;

-- Recreate the function with proper security
CREATE OR REPLACE FUNCTION public.is_company_member_secure(company_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members cm 
    WHERE cm.company_id = is_company_member_secure.company_id 
    AND cm.user_id = is_company_member_secure.user_id 
    AND cm.status = 'active'
  );
END;
$$;