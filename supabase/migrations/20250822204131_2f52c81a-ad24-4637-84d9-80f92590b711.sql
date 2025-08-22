-- Fix project_members RLS policy conflicts and secure database functions

-- First, drop the conflicting project_members policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can manage project members in companies they manage" ON project_members;
DROP POLICY IF EXISTS "Users can view project members in their companies" ON project_members;
DROP POLICY IF EXISTS "Users can update project members in their companies" ON project_members;
DROP POLICY IF EXISTS "Users can delete project members in their companies" ON project_members;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_project_accessible(target_project_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE p.id = target_project_id
    AND cm.user_id = target_user_id
    AND cm.status = 'active'
  );
END;
$$;

-- Create new consolidated RLS policies for project_members
CREATE POLICY "Members can view accessible project members"
ON project_members FOR SELECT
USING (public.is_project_accessible(project_id, auth.uid()));

CREATE POLICY "Admins can manage project members"
ON project_members FOR ALL
USING (
  public.can_manage_project_secure(project_id, auth.uid())
)
WITH CHECK (
  public.can_manage_project_secure(project_id, auth.uid())
);

-- Now fix all database functions to have secure search_path settings

-- Update update_tasks_updated_at function
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

-- Update generate_contract_number function
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

-- Update set_contract_number function
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

-- Update set_task_company_id function
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

-- Update handle_new_user_role function
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

-- Update update_system_configurations_updated_at function
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

-- Update ensure_unique_profile_slug function
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

-- Update update_daily_priorities_notes_updated_at function
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

-- Update update_estimate_line_items_updated_at function  
CREATE OR REPLACE FUNCTION public.update_estimate_line_items_updated_at()
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

-- Update generate_task_number function
CREATE OR REPLACE FUNCTION public.generate_task_number(project_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  project_prefix TEXT;
  next_number INTEGER;
  new_task_number TEXT;
BEGIN
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) 
  INTO project_prefix 
  FROM projects 
  WHERE id = project_id_param;
  
  IF project_prefix IS NULL OR project_prefix = '' THEN
    project_prefix := 'TSK';
  END IF;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(t.task_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM tasks t
  WHERE t.project_id = project_id_param 
  AND t.task_number IS NOT NULL 
  AND t.task_number ~ ('^' || project_prefix || '-[0-9]+$');
  
  new_task_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_task_number;
END;
$function$;

-- Update set_task_number function
CREATE OR REPLACE FUNCTION public.set_task_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.task_number IS NULL THEN
    NEW.task_number := public.generate_task_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$function$;