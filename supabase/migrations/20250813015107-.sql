-- Fix infinite recursion in project_members RLS policies
-- First, create security definer functions to avoid recursion

CREATE OR REPLACE FUNCTION public.is_project_member_secure(target_project_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = target_project_id 
    AND pm.user_id = target_user_id 
    AND pm.status = 'active'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_project_admin_secure(target_project_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = target_project_id 
    AND pm.user_id = target_user_id 
    AND pm.role = 'project_admin'
    AND pm.status = 'active'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_project_secure(target_project_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if user is project admin
  IF public.is_project_admin_secure(target_project_id, target_user_id) THEN
    RETURN true;
  END IF;
  
  -- Check if user is company owner/admin
  RETURN EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE p.id = target_project_id
    AND cm.user_id = target_user_id
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  );
END;
$$;

-- Drop existing problematic policies on project_members
DROP POLICY IF EXISTS "Company owners and admins can manage project members" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can manage project members" ON public.project_members;
DROP POLICY IF EXISTS "Project members can view other members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view project members they have access to" ON public.project_members;

-- Create secure RLS policies for project_members
CREATE POLICY "Secure project member access"
ON public.project_members
FOR ALL
USING (
  -- User can access their own membership
  (auth.uid() = user_id) OR
  -- Project admins can manage all members
  public.is_project_admin_secure(project_id, auth.uid()) OR
  -- Company owners/admins can manage members
  public.can_manage_project_secure(project_id, auth.uid()) OR
  -- Superadmins can access everything
  public.is_superadmin(auth.uid())
)
WITH CHECK (
  -- Only project admins and company owners can modify
  public.can_manage_project_secure(project_id, auth.uid()) OR
  public.is_superadmin(auth.uid())
);

-- Fix database functions to use proper search_path
CREATE OR REPLACE FUNCTION public.get_user_current_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    LIMIT 1
  );
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

CREATE OR REPLACE FUNCTION public.is_company_admin_or_owner(target_company_id uuid, target_user_id uuid)
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
    AND role = ANY (ARRAY['admin'::text, 'owner'::text])
    AND status = 'active'::text
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_company_member(target_company_id uuid, target_user_id uuid)
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
    AND status = 'active'::text
  );
END;
$$;

-- Create function to mask sensitive profile data
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  company text,
  slug text,
  rating numeric,
  review_count integer,
  email text,
  phone text,
  status text,
  public_profile boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requesting_user_id uuid := auth.uid();
  is_same_user boolean := false;
  is_company_colleague boolean := false;
BEGIN
  -- Check if requesting user is the same user
  is_same_user := (requesting_user_id = profile_user_id);
  
  -- Check if users are in the same company
  IF requesting_user_id IS NOT NULL AND NOT is_same_user THEN
    SELECT EXISTS(
      SELECT 1 FROM public.company_members cm1
      JOIN public.company_members cm2 ON cm1.company_id = cm2.company_id
      WHERE cm1.user_id = requesting_user_id 
      AND cm2.user_id = profile_user_id
      AND cm1.status = 'active' 
      AND cm2.status = 'active'
    ) INTO is_company_colleague;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.company,
    p.slug,
    p.rating,
    p.review_count,
    -- Only show email to same user, company colleagues, or if explicitly allowed
    CASE 
      WHEN is_same_user THEN p.email
      WHEN is_company_colleague THEN p.email
      WHEN p.show_email = true THEN p.email
      ELSE NULL 
    END as email,
    -- Only show phone to same user, company colleagues, or if explicitly allowed
    CASE 
      WHEN is_same_user THEN p.phone
      WHEN is_company_colleague THEN p.phone
      WHEN p.show_phone = true THEN p.phone
      ELSE NULL 
    END as phone,
    p.status,
    p.public_profile
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
END;
$$;

-- Add audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Log access to profile data
    INSERT INTO public.audit_logs (
        user_id, action, resource_type, resource_id, 
        metadata, created_at
    ) VALUES (
        auth.uid(), 'ACCESS', 'profile', 
        NEW.user_id,
        jsonb_build_object(
            'accessed_user_id', NEW.user_id,
            'access_type', 'profile_view'
        ),
        now()
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger for profile access logging (only if it doesn't exist)
DROP TRIGGER IF EXISTS profile_access_log ON public.profiles;
CREATE TRIGGER profile_access_log
    AFTER SELECT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_profile_access();

-- Secure leads table - mask contact information
CREATE OR REPLACE FUNCTION public.get_masked_lead_contact(
  lead_contact_email text,
  lead_contact_phone text,
  requesting_user_id uuid,
  lead_company_id uuid
)
RETURNS TABLE(masked_email text, masked_phone text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  can_view_full_contact boolean := false;
BEGIN
  -- Check if user can view full contact info (company member)
  SELECT public.is_company_member(lead_company_id, requesting_user_id) INTO can_view_full_contact;
  
  IF can_view_full_contact THEN
    RETURN QUERY SELECT lead_contact_email, lead_contact_phone;
  ELSE
    RETURN QUERY SELECT 
      public.mask_contact_info(lead_contact_email) as masked_email,
      public.mask_contact_info(lead_contact_phone) as masked_phone;
  END IF;
END;
$$;