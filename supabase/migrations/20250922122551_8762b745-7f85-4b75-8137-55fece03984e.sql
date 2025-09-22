-- Create function to handle user permission upserts
CREATE OR REPLACE FUNCTION public.handle_user_permission_upsert(
  p_user_id UUID,
  p_company_id UUID,
  p_module_id TEXT,
  p_sub_module_id TEXT,
  p_access_level TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update the permission
  INSERT INTO public.user_permissions (
    user_id, 
    company_id, 
    module_id, 
    sub_module_id, 
    access_level,
    created_by,
    updated_by
  )
  VALUES (
    p_user_id, 
    p_company_id, 
    p_module_id, 
    p_sub_module_id, 
    p_access_level,
    auth.uid(),
    auth.uid()
  )
  ON CONFLICT (user_id, company_id, module_id, sub_module_id)
  DO UPDATE SET
    access_level = EXCLUDED.access_level,
    updated_at = now(),
    updated_by = auth.uid();
END;
$$;