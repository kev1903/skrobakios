-- Fix function search path security warnings by adding proper search_path settings

-- Update all existing functions to include secure search_path
CREATE OR REPLACE FUNCTION public.get_user_current_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Get the first active company for the user
  -- In practice, this should be enhanced to get the user's currently selected company
  RETURN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    LIMIT 1
  );
END;
$$;

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
  -- Insert all available modules as disabled by default for the company
  FOREACH module_name_val IN ARRAY module_names
  LOOP
    INSERT INTO public.company_modules (company_id, module_name, enabled)
    VALUES (target_company_id, module_name_val, false)
    ON CONFLICT (company_id, module_name) DO NOTHING;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_simple_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create a simple active profile
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
  -- Initialize all modules as disabled for the new company
  PERFORM public.initialize_company_modules(NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_company_owner(target_company_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE company_id = target_company_id
    AND user_id = target_user_id
    AND role = 'owner'
    AND status = 'active'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_subscription()
RETURNS TABLE(subscription_id uuid, plan_name text, plan_description text, status text, billing_cycle text, trial_ends_at timestamp with time zone, current_period_end timestamp with time zone, price_monthly numeric, price_yearly numeric, features text[], max_projects integer, max_team_members integer, max_storage_gb integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get the highest priority role for the user
  SELECT role INTO user_role
  FROM public.user_roles 
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

CREATE OR REPLACE FUNCTION public.get_user_roles(target_user_id uuid)
RETURNS app_role[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
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
  FROM public.user_roles 
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(roles_array, ARRAY['user'::app_role]);
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
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Find valid invitation
  SELECT * INTO invitation_record 
  FROM public.project_invitations 
  WHERE token = invitation_token 
  AND email = user_email
  AND status = 'pending' 
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Update invitation as accepted
  UPDATE public.project_invitations 
  SET status = 'accepted', accepted_at = now(), updated_at = now()
  WHERE id = invitation_record.id;

  -- Add user to project_members
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

CREATE OR REPLACE FUNCTION public.handle_new_user_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  default_company_id UUID;
BEGIN
  -- For now, we'll create a personal company for each user
  -- In production, you might want different logic
  INSERT INTO public.companies (name, slug, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'company', NEW.email || '''s Company'),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'company', NEW.email), ' ', '-')) || '-' || EXTRACT(EPOCH FROM now())::TEXT,
    NEW.id
  ) RETURNING id INTO default_company_id;
  
  -- Add user as owner of their company
  INSERT INTO public.company_members (company_id, user_id, role, status)
  VALUES (default_company_id, NEW.id, 'owner', 'active');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN 'CT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('contract_number_seq')::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_contract_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.contract_number IS NULL THEN
    NEW.contract_number := generate_contract_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;