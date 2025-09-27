-- Fix search_path for security warning functions with exact signatures
-- Drop functions with exact signatures
DROP FUNCTION IF EXISTS public.get_current_context();
DROP FUNCTION IF EXISTS public.set_active_context(text, uuid);

-- Recreate get_current_context with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_context()
RETURNS TABLE(context_type text, context_id uuid, context_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    uc.context_type,
    uc.context_id,
    CASE 
      WHEN uc.context_type = 'personal' THEN CONCAT(p.first_name, ' ', p.last_name)
      WHEN uc.context_type = 'company' THEN c.name
      ELSE 'Unknown'
    END as context_name
  FROM public.user_contexts uc
  LEFT JOIN public.profiles p ON uc.user_id = p.user_id AND uc.context_type = 'personal'
  LEFT JOIN public.companies c ON uc.context_id = c.id AND uc.context_type = 'company'
  WHERE uc.user_id = auth.uid() AND uc.is_active = true
  LIMIT 1;
END;
$function$;

-- Recreate set_active_context with proper search_path and original default parameter
CREATE OR REPLACE FUNCTION public.set_active_context(p_context_type text, p_context_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;