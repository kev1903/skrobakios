-- SECURITY FIX: Add proper security settings to all database functions
-- This prevents SQL injection through function search path manipulation

-- Fix update_tasks_updated_at function
CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
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

-- Fix update_updated_at_column function
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

-- Fix enhanced_audit_log function
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

-- Fix calculate_invoice_total function
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

-- Fix calculate_bill_total function  
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

-- Fix calculate_item_amount function
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

-- Fix generate_contract_number function
CREATE OR REPLACE FUNCTION public.generate_contract_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'CT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('contract_number_seq')::TEXT, 6, '0');
END;
$function$;

-- Fix set_contract_number function
CREATE OR REPLACE FUNCTION public.set_contract_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.contract_number IS NULL THEN
    NEW.contract_number := generate_contract_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix set_task_company_id function
CREATE OR REPLACE FUNCTION public.set_task_company_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_profile RECORD;
BEGIN
  IF NEW.project_id IS NULL AND NEW.company_id IS NULL THEN
    SELECT cm.company_id INTO NEW.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
    LIMIT 1;
  END IF;

  IF NEW.assigned_to_user_id IS NULL AND NEW.assigned_to_name IS NULL THEN
    SELECT 
      p.user_id,
      CONCAT(p.first_name, ' ', p.last_name) as full_name,
      p.avatar_url
    INTO current_user_profile
    FROM profiles p
    WHERE p.user_id = auth.uid() AND p.status = 'active'
    LIMIT 1;

    IF current_user_profile.user_id IS NOT NULL THEN
      NEW.assigned_to_user_id := current_user_profile.user_id;
      NEW.assigned_to_name := TRIM(current_user_profile.full_name);
      NEW.assigned_to_avatar := current_user_profile.avatar_url;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- CLEANUP: Remove redundant RLS policies on profiles table
-- Drop overlapping policies that create conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- Create single, clear RLS policy for profile access
CREATE POLICY "Profile access control" ON public.profiles
FOR SELECT USING (
  -- Users can always view their own profile
  user_id = auth.uid() 
  OR 
  -- Public profiles are viewable by authenticated users
  (public_profile = true AND auth.role() = 'authenticated')
  OR
  -- Company members can view each other's profiles
  EXISTS (
    SELECT 1 FROM company_members cm1
    JOIN company_members cm2 ON cm1.company_id = cm2.company_id
    WHERE cm1.user_id = auth.uid() 
    AND cm2.user_id = profiles.user_id
    AND cm1.status = 'active' 
    AND cm2.status = 'active'
  )
);

-- Ensure users can only update their own profiles
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ensure users can only insert their own profiles  
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());