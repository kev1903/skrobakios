-- Create a comprehensive user deletion function that removes user from all related tables
-- This function will be called by the edge function with admin privileges

CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  deleted_count INTEGER := 0;
BEGIN
  -- Start transaction
  BEGIN
    -- Delete from all user-related tables in the correct order to avoid foreign key constraints
    
    -- Delete user roles
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete notifications
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete time entries
    DELETE FROM public.time_entries WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete time tracking settings
    DELETE FROM public.time_tracking_settings WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete invoice allocations
    DELETE FROM public.invoice_allocations WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete xero-related data
    DELETE FROM public.xero_oauth_states WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM public.xero_invoices WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM public.xero_contacts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM public.xero_accounts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM public.xero_connections WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete 3D models uploaded by user
    UPDATE public.model_3d SET uploaded_by = NULL WHERE uploaded_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Finally delete the profile (this should be last)
    DELETE FROM public.profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return success result
    result := json_build_object(
      'success', true,
      'message', 'User data deleted successfully',
      'user_id', target_user_id
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback and return error
    RAISE;
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', target_user_id
    );
    RETURN result;
  END;
END;
$$;

-- Grant execute permission to authenticated users (will be called by edge function)
GRANT EXECUTE ON FUNCTION public.delete_user_completely(UUID) TO authenticated;