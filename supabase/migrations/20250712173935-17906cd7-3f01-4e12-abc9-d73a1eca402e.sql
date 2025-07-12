-- First, update the user roles enum to match the new hierarchy system
-- Update user_roles to use the proper enum values from the database
UPDATE public.user_roles 
SET role = CASE 
  WHEN role = 'user' THEN 'client_viewer'
  WHEN role = 'admin' THEN 'project_manager'
  ELSE role
END
WHERE role IN ('user', 'admin');

-- Create company ownership relationships for proper hierarchical management
-- Add a function to check if user is company owner
CREATE OR REPLACE FUNCTION public.is_company_owner(target_company_id uuid, target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_id = target_company_id
    AND user_id = target_user_id
    AND role = 'owner'
    AND status = 'active'
  );
END;
$function$;

-- Create function to get user's highest role level for proper hierarchy
CREATE OR REPLACE FUNCTION public.get_user_highest_role_level(target_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  highest_level integer := 0;
  app_role_level integer := 0;
  company_role_level integer := 0;
BEGIN
  -- Check app-level role (superadmin has highest level)
  SELECT CASE 
    WHEN role = 'superadmin' THEN 100
    WHEN role = 'project_manager' THEN 50
    WHEN role = 'consultant' THEN 40
    WHEN role = 'subcontractor' THEN 30
    WHEN role = 'accounts' THEN 20
    WHEN role = 'client_viewer' THEN 10
    ELSE 0
  END INTO app_role_level
  FROM user_roles 
  WHERE user_id = target_user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'project_manager' THEN 2
      WHEN 'consultant' THEN 3
      WHEN 'subcontractor' THEN 4
      WHEN 'accounts' THEN 5
      WHEN 'client_viewer' THEN 6
    END
  LIMIT 1;

  -- Check company-level role (owner > admin > member)
  SELECT CASE 
    WHEN role = 'owner' THEN 90
    WHEN role = 'admin' THEN 80
    WHEN role = 'member' THEN 70
    ELSE 0
  END INTO company_role_level
  FROM company_members 
  WHERE user_id = target_user_id 
  AND status = 'active'
  ORDER BY 
    CASE role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'member' THEN 3
    END
  LIMIT 1;

  -- Return the highest level (app roles take precedence for platform management)
  RETURN GREATEST(COALESCE(app_role_level, 0), COALESCE(company_role_level, 0));
END;
$function$;

-- Create a function to list manageable users for hierarchical access
CREATE OR REPLACE FUNCTION public.get_manageable_users_for_user(requesting_user_id uuid)
 RETURNS TABLE(
   user_id uuid,
   email text,
   first_name text,
   last_name text,
   avatar_url text,
   phone text,
   company text,
   app_role app_role,
   company_role text,
   status text,
   created_at timestamp with time zone,
   can_manage_roles boolean,
   can_assign_to_companies boolean
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  requesting_user_level integer;
  is_superadmin boolean;
BEGIN
  -- Get requesting user's level and superadmin status
  SELECT get_user_highest_role_level(requesting_user_id) INTO requesting_user_level;
  SELECT has_role(requesting_user_id, 'superadmin') INTO is_superadmin;

  -- Return users based on hierarchy
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.phone,
    p.company,
    COALESCE(ur.role, 'client_viewer'::app_role) as app_role,
    COALESCE(cm.role, 'none') as company_role,
    p.status,
    p.created_at,
    -- Can manage roles if requesting user has higher level
    (requesting_user_level > get_user_highest_role_level(p.user_id)) as can_manage_roles,
    -- Only superadmins can assign to companies
    is_superadmin as can_assign_to_companies
  FROM profiles p
  LEFT JOIN user_roles ur ON p.user_id = ur.user_id
  LEFT JOIN company_members cm ON p.user_id = cm.user_id AND cm.status = 'active'
  WHERE 
    -- Superadmins can see everyone
    (is_superadmin) 
    OR 
    -- Company owners can see their company members
    (p.user_id IN (
      SELECT cm2.user_id 
      FROM company_members cm2 
      JOIN company_members requesting_cm ON cm2.company_id = requesting_cm.company_id
      WHERE requesting_cm.user_id = requesting_user_id 
      AND requesting_cm.role = 'owner' 
      AND requesting_cm.status = 'active'
      AND cm2.status = 'active'
    ))
  ORDER BY p.created_at DESC;
END;
$function$;