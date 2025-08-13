-- Fix remaining functions with proper search_path (avoiding app_role type issues)

CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_company_modules(target_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_wbs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_time_entries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_estimates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_simple_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_new_company_modules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.initialize_company_modules(NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_project_network_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_project_costs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_project_invitation(invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_user_companies(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(id uuid, name text, slug text, logo_url text, role text, status text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.logo_url,
    cm.role,
    cm.status
  FROM public.companies c
  JOIN public.company_members cm ON c.id = cm.company_id
  WHERE cm.user_id = target_user_id
  AND cm.status = 'active'
  ORDER BY c.name;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_level integer;
  target_user_level integer;
BEGIN
  SELECT public.get_user_highest_role_level(auth.uid()) INTO current_user_level;
  SELECT public.get_user_highest_role_level(target_user_id) INTO target_user_level;
  
  RETURN current_user_level > target_user_level;
END;
$$;