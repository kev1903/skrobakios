-- Add function to safely delete a company and all related data
CREATE OR REPLACE FUNCTION public.delete_company_completely(target_company_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  deleted_count INTEGER := 0;
BEGIN
  -- Only allow superadmins to delete companies
  IF NOT public.is_platform_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Only superadmins can delete companies',
      'company_id', target_company_id
    );
  END IF;

  -- Start transaction
  BEGIN
    -- Delete all related data in the correct order to avoid foreign key constraints
    
    -- Delete company modules
    DELETE FROM public.company_modules WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete company members
    DELETE FROM public.company_members WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete leads
    DELETE FROM public.leads WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete time entries
    DELETE FROM public.time_entries WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete digital objects
    DELETE FROM public.digital_objects WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete wbs items
    DELETE FROM public.wbs_items WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete estimates
    DELETE FROM public.estimates WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete projects and related data
    DELETE FROM public.projects WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Finally delete the company itself
    DELETE FROM public.companies WHERE id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return success result
    result := json_build_object(
      'success', true,
      'message', 'Company and all related data deleted successfully',
      'company_id', target_company_id
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback and return error
    RAISE;
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'company_id', target_company_id
    );
    RETURN result;
  END;
END;
$$;