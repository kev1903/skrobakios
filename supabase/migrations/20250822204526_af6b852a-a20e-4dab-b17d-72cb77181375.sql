-- Fix remaining database functions security settings - Final batch

-- Update update_invoice_payment_status function
CREATE OR REPLACE FUNCTION public.update_invoice_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invoice_total NUMERIC;
  total_paid NUMERIC;
BEGIN
  SELECT total INTO invoice_total FROM invoices WHERE id = NEW.invoice_id;
  SELECT COALESCE(SUM(amount), 0) INTO total_paid FROM invoice_payments WHERE invoice_id = NEW.invoice_id;
  
  UPDATE invoices 
  SET 
    paid_to_date = total_paid,
    status = CASE 
      WHEN total_paid = 0 THEN 'sent'::invoice_status
      WHEN total_paid >= invoice_total THEN 'paid'::invoice_status
      ELSE 'part_paid'::invoice_status
    END,
    updated_at = now()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$function$;

-- Update update_bill_payment_status function
CREATE OR REPLACE FUNCTION public.update_bill_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  bill_total NUMERIC;
  total_paid NUMERIC;
BEGIN
  SELECT total INTO bill_total FROM bills WHERE id = NEW.bill_id;
  SELECT COALESCE(SUM(amount), 0) INTO total_paid FROM bill_payments WHERE bill_id = NEW.bill_id;
  
  UPDATE bills 
  SET 
    paid_to_date = total_paid,
    status = CASE 
      WHEN total_paid >= bill_total THEN 'paid'::bill_status
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.bill_id;
  
  RETURN NEW;
END;
$function$;

-- Update create_invoice function
CREATE OR REPLACE FUNCTION public.create_invoice(p_project_id uuid, p_client_name text, p_client_email text DEFAULT NULL::text, p_due_date date DEFAULT NULL::date, p_items jsonb DEFAULT '[]'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invoice_id UUID;
  invoice_number TEXT;
  item JSONB;
BEGIN
  SELECT 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0') INTO invoice_number;
  
  INSERT INTO invoices (project_id, number, client_name, client_email, due_date, created_by)
  VALUES (p_project_id, invoice_number, p_client_name, p_client_email, COALESCE(p_due_date, CURRENT_DATE + 30), auth.uid())
  RETURNING id INTO invoice_id;
  
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO invoice_items (invoice_id, description, qty, rate, wbs_code)
    VALUES (
      invoice_id,
      item->>'description',
      (item->>'qty')::NUMERIC,
      (item->>'rate')::NUMERIC,
      item->>'wbs_code'
    );
  END LOOP;
  
  RETURN invoice_id;
END;
$function$;

-- Update generate_invoice_number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
END;
$function$;

-- Update initialize_company_modules function
CREATE OR REPLACE FUNCTION public.initialize_company_modules(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  module_name_val text;
  module_names text[] := ARRAY[
    'projects',
    'finance', 
    'sales',
    'dashboard',
    'digital-twin',
    'cost-contracts',
    'tasks',
    'files',
    'team',
    'digital-objects'
  ];
BEGIN
  FOREACH module_name_val IN ARRAY module_names
  LOOP
    INSERT INTO public.company_modules (company_id, module_name, enabled)
    VALUES (target_company_id, module_name_val, false)
    ON CONFLICT (company_id, module_name) DO NOTHING;
  END LOOP;
END;
$function$;

-- Update update_wbs_updated_at function
CREATE OR REPLACE FUNCTION public.update_wbs_updated_at()
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

-- Update update_time_entries_updated_at function
CREATE OR REPLACE FUNCTION public.update_time_entries_updated_at()
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

-- Update update_estimates_updated_at function
CREATE OR REPLACE FUNCTION public.update_estimates_updated_at()
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

-- Update handle_simple_user_signup function
CREATE OR REPLACE FUNCTION public.handle_simple_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    'active'
  );
  
  RETURN NEW;
END;
$function$;

-- Update handle_new_company_modules function
CREATE OR REPLACE FUNCTION public.handle_new_company_modules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.initialize_company_modules(NEW.id);
  RETURN NEW;
END;
$function$;

-- Update generate_invitation_token function
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$function$;

-- Update update_project_network_updated_at function
CREATE OR REPLACE FUNCTION public.update_project_network_updated_at()
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

-- Update update_project_costs_updated_at function
CREATE OR REPLACE FUNCTION public.update_project_costs_updated_at()
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

-- Update accept_project_invitation function
CREATE OR REPLACE FUNCTION public.accept_project_invitation(invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
  result JSON;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  SELECT * INTO invitation_record 
  FROM public.project_invitations 
  WHERE token = invitation_token 
  AND email = user_email
  AND status = 'pending' 
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  UPDATE public.project_invitations 
  SET status = 'accepted', accepted_at = now(), updated_at = now()
  WHERE id = invitation_record.id;

  INSERT INTO public.project_members (
    project_id, user_id, email, role, status, invited_by, invited_at, joined_at
  ) VALUES (
    invitation_record.project_id, 
    auth.uid(), 
    user_email, 
    invitation_record.role, 
    'active', 
    invitation_record.invited_by, 
    invitation_record.created_at, 
    now()
  )
  ON CONFLICT (project_id, user_id) DO UPDATE SET
    status = 'active',
    role = invitation_record.role,
    joined_at = now(),
    updated_at = now();

  RETURN json_build_object(
    'success', true, 
    'project_id', invitation_record.project_id,
    'role', invitation_record.role
  );
END;
$function$;

-- Update ensure_user_has_active_company function
CREATE OR REPLACE FUNCTION public.ensure_user_has_active_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  active_count INTEGER;
  fallback_company_id UUID;
BEGIN
  IF (OLD.status = 'active' AND NEW.status = 'inactive') THEN
    SELECT COUNT(*) INTO active_count
    FROM public.company_members
    WHERE user_id = NEW.user_id AND status = 'active';

    IF active_count = 0 THEN
      SELECT id INTO fallback_company_id
      FROM public.company_members
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT 1;

      IF fallback_company_id IS NOT NULL THEN
        UPDATE public.company_members
        SET status = 'active', updated_at = now()
        WHERE user_id = NEW.user_id AND company_id = fallback_company_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;