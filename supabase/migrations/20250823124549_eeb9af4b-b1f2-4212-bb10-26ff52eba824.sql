-- Fix remaining database functions that lack proper search_path security
-- This addresses the remaining security warnings

-- Fix the remaining functions that don't have SET search_path TO 'public'

-- Fix validate_json_fields function
CREATE OR REPLACE FUNCTION public.validate_json_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'companies' THEN
    IF NEW.social_links IS NOT NULL THEN
      IF jsonb_typeof(NEW.social_links) != 'object' THEN
        NEW.social_links := '{}'::jsonb;
      END IF;
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.social_links IS NOT NULL THEN
      IF jsonb_typeof(NEW.social_links) != 'object' THEN
        NEW.social_links := '{}'::jsonb;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix ensure_unique_profile_slug function
CREATE OR REPLACE FUNCTION public.ensure_unique_profile_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  IF NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
    base_slug := generate_slug(NEW.first_name || '-' || NEW.last_name);
  ELSIF NEW.first_name IS NOT NULL THEN
    base_slug := generate_slug(NEW.first_name);
  ELSE
    base_slug := 'user-' || substr(NEW.user_id::text, 1, 8);
  END IF;
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = final_slug AND user_id != NEW.user_id) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  NEW.slug := final_slug;
  
  RETURN NEW;
END;
$function$;

-- Fix update_daily_priorities_notes_updated_at function
CREATE OR REPLACE FUNCTION public.update_daily_priorities_notes_updated_at()
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

-- Fix update_platform_settings_updated_at function
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

-- Fix update_system_configurations_updated_at function
CREATE OR REPLACE FUNCTION public.update_system_configurations_updated_at()
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

-- Fix handle_new_user_role function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role);
  RETURN NEW;
END;
$function$;

-- Fix update_rating_stats function
CREATE OR REPLACE FUNCTION public.update_rating_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update user ratings
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.reviewee_type = 'user' THEN
      UPDATE public.profiles 
      SET 
        rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id AND reviewee_type = 'user' AND status = 'active'),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id AND reviewee_type = 'user' AND status = 'active')
      WHERE user_id = NEW.reviewee_id;
    ELSIF NEW.reviewee_type = 'company' THEN
      UPDATE public.companies 
      SET 
        rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id AND reviewee_type = 'company' AND status = 'active'),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id AND reviewee_type = 'company' AND status = 'active')
      WHERE id = NEW.reviewee_id;
    END IF;
  END IF;

  -- Handle deletions
  IF TG_OP = 'DELETE' THEN
    IF OLD.reviewee_type = 'user' THEN
      UPDATE public.profiles 
      SET 
        rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id AND reviewee_type = 'user' AND status = 'active'), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id AND reviewee_type = 'user' AND status = 'active')
      WHERE user_id = OLD.reviewee_id;
    ELSIF OLD.reviewee_type = 'company' THEN
      UPDATE public.companies 
      SET 
        rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id AND reviewee_type = 'company' AND status = 'active'), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id AND reviewee_type = 'company' AND status = 'active')
      WHERE id = OLD.reviewee_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix update_invoice_payment_status function
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

-- Fix update_bill_payment_status function
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

-- Fix handle_new_company_modules function
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

-- Fix ensure_user_has_active_company function
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

-- Fix update_project_contracts_updated_at function
CREATE OR REPLACE FUNCTION public.update_project_contracts_updated_at()
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