-- Updated delete_company_completely function without non-existent tables
CREATE OR REPLACE FUNCTION public.delete_company_completely(target_company_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    -- Delete wbs items
    DELETE FROM public.wbs_items WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete activities 
    DELETE FROM public.activities WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete estimates
    DELETE FROM public.estimates WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete stakeholders and related data
    DELETE FROM public.stakeholder_activities WHERE stakeholder_id IN (
      SELECT id FROM public.stakeholders WHERE company_id = target_company_id
    );
    DELETE FROM public.stakeholder_contacts WHERE stakeholder_id IN (
      SELECT id FROM public.stakeholders WHERE company_id = target_company_id
    );
    DELETE FROM public.stakeholder_addresses WHERE stakeholder_id IN (
      SELECT id FROM public.stakeholders WHERE company_id = target_company_id
    );
    DELETE FROM public.stakeholder_documents WHERE stakeholder_id IN (
      SELECT id FROM public.stakeholders WHERE company_id = target_company_id
    );
    DELETE FROM public.stakeholders WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete vendors and related compliance docs
    DELETE FROM public.compliance_docs WHERE vendor_id IN (
      SELECT id FROM public.vendors WHERE company_id = target_company_id
    );
    DELETE FROM public.vendors WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete project related data
    DELETE FROM public.project_costs WHERE company_id = target_company_id;
    DELETE FROM public.sk_25008_design WHERE company_id = target_company_id;
    DELETE FROM public.issue_reports WHERE company_id = target_company_id;
    
    -- Delete projects and related data
    DELETE FROM public.projects WHERE company_id = target_company_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete skai memory
    DELETE FROM public.skai_memory WHERE company_id = target_company_id;
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
$function$;