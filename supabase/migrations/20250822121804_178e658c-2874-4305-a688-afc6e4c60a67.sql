-- Complete Remaining Function Search Path Fixes
-- Phase 2: Fix all remaining functions without SET search_path

-- Fix all remaining functions that need search_path hardening
CREATE OR REPLACE FUNCTION public.get_user_roles(target_user_id uuid)
RETURNS app_role[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  roles_array app_role[];
BEGIN
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

CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN 'CT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('contract_number_seq')::TEXT, 6, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_contract_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id uuid)
RETURNS TABLE(user_id uuid, first_name text, last_name text, avatar_url text, company text, slug text, rating numeric, review_count integer, email text, phone text, status text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.company,
    p.slug,
    p.rating,
    p.review_count,
    CASE WHEN p.show_email = true THEN p.email ELSE NULL END as email,
    CASE WHEN p.show_phone = true THEN p.phone ELSE NULL END as phone,
    p.status
  FROM profiles p
  WHERE p.user_id = profile_user_id 
  AND p.public_profile = true
  AND p.status = 'active';
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_system_configurations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_unique_profile_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.ensure_unique_company_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name) THEN
    base_slug := generate_slug(NEW.name);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM companies WHERE slug = final_slug AND id != NEW.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_daily_priorities_notes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;