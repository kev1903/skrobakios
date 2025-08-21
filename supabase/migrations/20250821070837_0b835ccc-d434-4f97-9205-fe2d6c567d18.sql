-- Allow superadmins to manage and view user permissions and company settings

-- Add policies for user_permissions
CREATE POLICY "Superadmins can view all user permissions"
ON public.user_permissions
FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage all user permissions"
ON public.user_permissions
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- Add policies for company_permission_settings
CREATE POLICY "Superadmins can view company permission settings"
ON public.company_permission_settings
FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage company permission settings"
ON public.company_permission_settings
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- Update function to allow superadmins too
CREATE OR REPLACE FUNCTION public.set_user_permissions(
  target_user_id UUID,
  target_company_id UUID,
  permissions_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  permission_item JSONB;
  result JSON;
  is_admin BOOLEAN := false;
  is_super BOOLEAN := false;
BEGIN
  -- Check if requester is superadmin
  SELECT public.is_superadmin(auth.uid()) INTO is_super;

  -- Check if requester is company owner/admin
  SELECT EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = target_company_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  ) INTO is_admin;

  IF NOT (is_super OR is_admin) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Process each permission
  FOR permission_item IN SELECT * FROM jsonb_array_elements(permissions_data)
  LOOP
    INSERT INTO public.user_permissions (
      user_id,
      company_id,
      permission_key,
      granted,
      granted_by,
      granted_at
    ) VALUES (
      target_user_id,
      target_company_id,
      permission_item->>'permission_key',
      (permission_item->>'granted')::boolean,
      auth.uid(),
      now()
    )
    ON CONFLICT (user_id, company_id, permission_key)
    DO UPDATE SET
      granted = EXCLUDED.granted,
      granted_by = EXCLUDED.granted_by,
      granted_at = EXCLUDED.granted_at,
      updated_at = now();
  END LOOP;

  RETURN json_build_object('success', true, 'message', 'Permissions updated successfully');
END;
$$;