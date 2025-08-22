-- Fix all remaining functions missing search_path to prevent SQL injection

CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS TABLE(subscription_id uuid, plan_name text, plan_description text, status text, billing_cycle text, trial_ends_at timestamp with time zone, current_period_end timestamp with time zone, price_monthly numeric, price_yearly numeric, features text[], max_projects integer, max_team_members integer, max_storage_gb integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    us.id as subscription_id,
    sp.name as plan_name,
    sp.description as plan_description,
    us.status,
    us.billing_cycle,
    us.trial_ends_at,
    us.current_period_end,
    sp.price_monthly,
    sp.price_yearly,
    sp.features,
    sp.max_projects,
    sp.max_team_members,
    sp.max_storage_gb
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Get the highest priority role for the user
  SELECT role INTO user_role
  FROM user_roles 
  WHERE user_id = target_user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'business_admin' THEN 2
      WHEN 'project_admin' THEN 3
      WHEN 'user' THEN 4
      WHEN 'client' THEN 5
    END
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user'::app_role);
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_access_project_contracts(project_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = project_id_param
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_project_contracts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(target_user_id uuid)
RETURNS app_role[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  roles_array app_role[];
BEGIN
  -- Get all roles for the user as an array
  SELECT ARRAY_AGG(role ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'business_admin' THEN 2
      WHEN 'project_admin' THEN 3
      WHEN 'user' THEN 4
      WHEN 'client' THEN 5
    END
  ) INTO roles_array
  FROM user_roles 
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(roles_array, ARRAY['user'::app_role]);
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_superadmin(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = target_user_id 
    AND role = 'superadmin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_project_member(target_project_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  select exists (
    select 1
    from project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = target_user_id
      and pm.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.debug_user_company_access(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(company_id uuid, company_name text, user_role text, membership_status text, can_see_projects boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    cm.company_id,
    c.name as company_name,
    cm.role as user_role,
    cm.status as membership_status,
    (cm.status = 'active') as can_see_projects
  FROM company_members cm
  JOIN companies c ON cm.company_id = c.id
  WHERE cm.user_id = target_user_id
  ORDER BY cm.status DESC, c.name;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  default_company_id UUID;
BEGIN
  -- For now, we'll create a personal company for each user
  -- In production, you might want different logic
  INSERT INTO companies (name, slug, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'company', NEW.email || '''s Company'),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'company', NEW.email), ' ', '-')) || '-' || EXTRACT(EPOCH FROM now())::TEXT,
    NEW.id
  ) RETURNING id INTO default_company_id;
  
  -- Add user as owner of their company
  INSERT INTO company_members (company_id, user_id, role, status)
  VALUES (default_company_id, NEW.id, 'owner', 'active');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN 'CT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('contract_number_seq')::TEXT, 6, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_contract_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.contract_number IS NULL THEN
    NEW.contract_number := generate_contract_number();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_task_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_profile RECORD;
BEGIN
  -- If it's a personal task (no project_id) and no company_id is set,
  -- set it to the user's first active company
  IF NEW.project_id IS NULL AND NEW.company_id IS NULL THEN
    SELECT cm.company_id INTO NEW.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    LIMIT 1;
  END IF;

  -- If no assignee is specified, auto-assign to the current user
  IF NEW.assigned_to_user_id IS NULL AND NEW.assigned_to_name IS NULL THEN
    -- Get current user's profile information
    SELECT 
      p.user_id,
      CONCAT(p.first_name, ' ', p.last_name) as full_name,
      p.avatar_url
    INTO current_user_profile
    FROM profiles p
    WHERE p.user_id = auth.uid() AND p.status = 'active'
    LIMIT 1;

    -- Set assignment fields if user profile exists
    IF current_user_profile.user_id IS NOT NULL THEN
      NEW.assigned_to_user_id := current_user_profile.user_id;
      NEW.assigned_to_name := TRIM(current_user_profile.full_name);
      NEW.assigned_to_avatar := current_user_profile.avatar_url;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profile(_user_id uuid)
RETURNS TABLE(id uuid, email text, first_name text, last_name text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    p.id,
    u.email,
    p.first_name,
    p.last_name,
    p.avatar_url
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.user_id = _user_id;
$function$;

CREATE OR REPLACE FUNCTION public.log_user_action(_action text, _resource_type text, _resource_id uuid DEFAULT NULL::uuid, _metadata jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    _action,
    _resource_type,
    _resource_id,
    _metadata,
    now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_member_of_company(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM company_members cm
    WHERE cm.company_id = p_company_id
      AND cm.user_id = p_user_id
      AND cm.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(trim(input_text), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$function$;

CREATE OR REPLACE FUNCTION public.copy_monday_blocks_to_weekdays(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  monday_block RECORD;
  new_day INTEGER;
BEGIN
  -- Loop through each Monday time block for the user
  FOR monday_block IN 
    SELECT * FROM time_blocks 
    WHERE user_id = target_user_id AND day_of_week = 1
  LOOP
    -- Copy to Tuesday (2), Wednesday (3), Thursday (4), Friday (5)
    FOR new_day IN 2..5 LOOP
      -- Delete existing blocks for this day first
      DELETE FROM time_blocks 
      WHERE user_id = target_user_id AND day_of_week = new_day;
      
      -- Insert copy of Monday block
      INSERT INTO time_blocks (
        user_id, day_of_week, start_time, end_time, 
        title, description, category, color
      ) VALUES (
        target_user_id, new_day, monday_block.start_time, monday_block.end_time,
        monday_block.title, monday_block.description, monday_block.category, monday_block.color
      );
    END LOOP;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.copy_my_monday_blocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  PERFORM copy_monday_blocks_to_weekdays(auth.uid());
END;
$function$;

-- Continue with remaining functions...
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result JSON;
  deleted_count INTEGER := 0;
  total_deleted INTEGER := 0;
BEGIN
  -- Start transaction
  BEGIN
    -- Delete from all user-related tables in the correct order to avoid foreign key constraints
    
    -- Delete user roles first
    DELETE FROM user_roles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % user_roles records', deleted_count;
    
    -- Delete notifications
    DELETE FROM notifications WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % notifications records', deleted_count;
    
    -- Delete time entries
    DELETE FROM time_entries WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % time_entries records', deleted_count;
    
    -- Delete time tracking settings
    DELETE FROM time_tracking_settings WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % time_tracking_settings records', deleted_count;
    
    -- Delete time blocks
    DELETE FROM time_blocks WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % time_blocks records', deleted_count;
    
    -- Delete time categories
    DELETE FROM time_categories WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % time_categories records', deleted_count;
    
    -- Delete invoice allocations
    DELETE FROM invoice_allocations WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % invoice_allocations records', deleted_count;
    
    -- Delete xero-related data
    DELETE FROM xero_oauth_states WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM xero_invoices WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM xero_contacts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM xero_accounts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM xero_connections WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % xero-related records total', deleted_count;
    
    -- Delete AI chat logs and interactions
    DELETE FROM ai_chat_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM ai_chat_interactions WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % AI chat records total', deleted_count;
    
    -- Delete subscription and billing data
    DELETE FROM user_subscriptions WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM billing_history WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % subscription/billing records total', deleted_count;
    
    -- Delete user access tokens
    DELETE FROM user_access_tokens WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % user_access_tokens records', deleted_count;
    
    -- Delete user contexts
    DELETE FROM user_contexts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % user_contexts records', deleted_count;
    
    -- Update references to NULL instead of deleting
    UPDATE model_3d SET uploaded_by = NULL WHERE uploaded_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % model_3d records to remove user reference', deleted_count;
    
    UPDATE companies SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % companies records to remove user reference', deleted_count;
    
    UPDATE estimates SET created_by = NULL WHERE created_by = target_user_id;
    UPDATE estimates SET last_modified_by = NULL WHERE last_modified_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % estimates records to remove user references', deleted_count;
    
    UPDATE project_costs SET created_by = NULL WHERE created_by = target_user_id;
    UPDATE project_costs SET last_modified_by = NULL WHERE last_modified_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % project_costs records to remove user references', deleted_count;
    
    -- Delete company memberships for this user
    DELETE FROM company_members WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % company_members records', deleted_count;
    
    -- Delete project memberships
    DELETE FROM project_members WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % project_members records', deleted_count;
    
    -- Finally delete the profile (this should be last)
    DELETE FROM profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % profiles records', deleted_count;
    
    -- Return success result
    result := json_build_object(
      'success', true,
      'message', 'User data deleted successfully',
      'user_id', target_user_id,
      'total_records_deleted', total_deleted
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Return error with more details
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE,
      'user_id', target_user_id,
      'total_records_deleted', total_deleted
    );
    RETURN result;
  END;
END;
$function$;