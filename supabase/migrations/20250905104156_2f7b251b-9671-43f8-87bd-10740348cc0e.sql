-- Address linter warnings by setting explicit search_path on functions lacking it

-- 1) update_company_members_updated_at
CREATE OR REPLACE FUNCTION public.update_company_members_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('superadmin', 'platform_admin')
  );
END;
$$;

-- 3) track_first_login
CREATE OR REPLACE FUNCTION public.track_first_login(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles 
    SET first_login_at = now(),
        account_activated = true,
        updated_at = now()
    WHERE user_id = target_user_id 
    AND first_login_at IS NULL;
END;
$$;

-- 4) generate_access_token
CREATE OR REPLACE FUNCTION public.generate_access_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64');
END;
$$;

-- 5) delete_company_completely
CREATE OR REPLACE FUNCTION public.delete_company_completely(target_company_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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