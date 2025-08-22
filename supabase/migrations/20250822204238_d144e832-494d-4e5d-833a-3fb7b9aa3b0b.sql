-- Fix remaining database functions security settings

-- Update update_platform_settings_updated_at function
CREATE OR REPLACE FUNCTION public.update_platform_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update start_user_trial function
CREATE OR REPLACE FUNCTION public.start_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    billing_cycle,
    trial_ends_at,
    current_period_start,
    current_period_end
  )
  SELECT 
    NEW.user_id,
    sp.id,
    'trial',
    'monthly',
    NOW() + INTERVAL '90 days',
    NOW(),
    NOW() + INTERVAL '90 days'
  FROM public.subscription_plans sp
  WHERE sp.name = 'FREE'
  LIMIT 1;
  
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update log_sensitive_data_access function
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF TG_TABLE_NAME = 'xero_connections' THEN
        INSERT INTO public.audit_logs (
            user_id, action, resource_type, resource_id, 
            metadata, created_at
        ) VALUES (
            auth.uid(), TG_OP, 'xero_connection', 
            COALESCE(NEW.id, OLD.id),
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'tenant_id', COALESCE(NEW.tenant_id, OLD.tenant_id)
            ),
            now()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update mask_contact_info function
CREATE OR REPLACE FUNCTION public.mask_contact_info(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    IF input_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN LEFT(input_text, 3) || '***@' || SPLIT_PART(input_text, '@', 2);
    END IF;
    
    IF input_text ~ '^[\+\-\(\)\s\d]+$' AND LENGTH(REGEXP_REPLACE(input_text, '[^\d]', '', 'g')) >= 7 THEN
        RETURN '***-***-' || RIGHT(REGEXP_REPLACE(input_text, '[^\d]', '', 'g'), 4);
    END IF;
    
    IF LENGTH(input_text) > 6 THEN
        RETURN LEFT(input_text, 2) || REPEAT('*', LENGTH(input_text) - 4) || RIGHT(input_text, 2);
    END IF;
    
    RETURN input_text;
END;
$function$;

-- Update generate_rfi_number function  
CREATE OR REPLACE FUNCTION public.generate_rfi_number(project_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_rfi_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'RFI';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(r.rfi_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM rfis r
  WHERE r.project_id = project_id_param 
  AND r.rfi_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_rfi_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_rfi_number;
END;
$function$;

-- Update generate_issue_number function
CREATE OR REPLACE FUNCTION public.generate_issue_number(project_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_issue_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'ISS';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(i.issue_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM issues i
  WHERE i.project_id = project_id_param 
  AND i.issue_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_issue_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_issue_number;
END;
$function$;

-- Update log_invitation_access function
CREATE OR REPLACE FUNCTION public.log_invitation_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, action, resource_type, resource_id, 
        metadata, created_at
    ) VALUES (
        auth.uid(), TG_OP, 'project_invitation', 
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'email_domain', SPLIT_PART(COALESCE(NEW.email, OLD.email), '@', 2),
            'project_id', COALESCE(NEW.project_id, OLD.project_id),
            'status', COALESCE(NEW.status, OLD.status)
        ),
        now()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update mask_invitation_email function
CREATE OR REPLACE FUNCTION public.mask_invitation_email(invitation_email text, requesting_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = requesting_user_id;
    
    IF invitation_email = user_email THEN
        RETURN invitation_email;
    END IF;
    
    IF invitation_email IS NOT NULL THEN
        RETURN LEFT(invitation_email, 3) || '***@' || SPLIT_PART(invitation_email, '@', 2);
    END IF;
    
    RETURN NULL;
END;
$function$;

-- Update check_invitation_rate_limit function
CREATE OR REPLACE FUNCTION public.check_invitation_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    recent_invitations INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_invitations
    FROM public.project_invitations
    WHERE invited_by = NEW.invited_by
    AND created_at > now() - interval '1 hour';
    
    IF recent_invitations >= 10 THEN
        RAISE EXCEPTION 'Rate limit exceeded: Too many invitations sent recently. Please wait before sending more invitations.';
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Update generate_defect_number function
CREATE OR REPLACE FUNCTION public.generate_defect_number(project_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_defect_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'DEF';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(d.defect_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM defects d
  WHERE d.project_id = project_id_param 
  AND d.defect_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_defect_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_defect_number;
END;
$function$;

-- Update set_rfi_number function
CREATE OR REPLACE FUNCTION public.set_rfi_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.rfi_number IS NULL THEN
    NEW.rfi_number := generate_rfi_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Update set_issue_number function
CREATE OR REPLACE FUNCTION public.set_issue_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.issue_number IS NULL THEN
    NEW.issue_number := generate_issue_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Update set_defect_number function
CREATE OR REPLACE FUNCTION public.set_defect_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.defect_number IS NULL THEN
    NEW.defect_number := generate_defect_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Update enhanced_audit_log function
CREATE OR REPLACE FUNCTION public.enhanced_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_TABLE_NAME IN ('user_roles', 'company_members', 'project_members', 'user_permissions') THEN
    INSERT INTO public.audit_logs (
      user_id, action, resource_type, resource_id, 
      metadata, created_at
    ) VALUES (
      auth.uid(), TG_OP, TG_TABLE_NAME, 
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'old_data', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      ),
      now()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update calculate_invoice_total function
CREATE OR REPLACE FUNCTION public.calculate_invoice_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE invoices 
  SET 
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
    total = subtotal + tax,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update calculate_bill_total function
CREATE OR REPLACE FUNCTION public.calculate_bill_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE bills 
  SET 
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM bill_items WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)),
    total = subtotal + tax,
    updated_at = now()
  WHERE id = COALESCE(NEW.bill_id, OLD.bill_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update calculate_item_amount function
CREATE OR REPLACE FUNCTION public.calculate_item_amount()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.amount = NEW.qty * NEW.rate;
  RETURN NEW;
END;
$function$;