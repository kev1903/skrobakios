
-- Create a function to delete an invoice and its items
-- This bypasses RLS issues by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.delete_invoice_with_items(invoice_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
  v_user_id uuid;
  v_has_access boolean;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get the project_id for this invoice
  SELECT project_id INTO v_project_id
  FROM public.invoices
  WHERE id = invoice_id_param;
  
  -- Check if invoice exists
  IF v_project_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invoice not found');
  END IF;
  
  -- Check if user has access to this project through company membership
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE p.id = v_project_id
    AND cm.user_id = v_user_id
    AND cm.status = 'active'
  ) INTO v_has_access;
  
  -- If user doesn't have access, return error
  IF NOT v_has_access THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  -- Delete invoice items first (just to be explicit, though CASCADE should handle this)
  DELETE FROM public.invoice_items WHERE invoice_id = invoice_id_param;
  
  -- Delete the invoice
  DELETE FROM public.invoices WHERE id = invoice_id_param;
  
  -- Return success
  RETURN json_build_object('success', true, 'message', 'Invoice deleted successfully');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_invoice_with_items(uuid) TO authenticated;
