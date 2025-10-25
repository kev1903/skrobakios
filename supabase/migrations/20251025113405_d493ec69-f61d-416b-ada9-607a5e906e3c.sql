
-- Update the delete function to be more robust
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
  v_deleted_items integer;
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
    RETURN json_build_object('success', false, 'error', 'Access denied - you do not have permission to delete this invoice');
  END IF;
  
  -- Delete invoice items (explicit delete before CASCADE)
  DELETE FROM public.invoice_items WHERE invoice_id = invoice_id_param;
  GET DIAGNOSTICS v_deleted_items = ROW_COUNT;
  
  -- Delete the invoice
  DELETE FROM public.invoices WHERE id = invoice_id_param;
  
  -- Check if delete was successful
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Failed to delete invoice');
  END IF;
  
  -- Return success
  RETURN json_build_object(
    'success', true, 
    'message', 'Invoice deleted successfully',
    'deleted_items', v_deleted_items
  );
END;
$$;
