-- Fix the database structure and function to handle invited users properly
-- First, let's update the get_manageable_users_for_user function to handle NULL user_ids

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
  app_roles app_role[], 
  company_role text, 
  status text, 
  created_at timestamp with time zone, 
  can_manage_roles boolean, 
  can_assign_to_companies boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requesting_user_level integer;
  is_superadmin boolean;
BEGIN
  -- Get requesting user's level and superadmin status
  SELECT public.get_user_highest_role_level(requesting_user_id) INTO requesting_user_level;
  SELECT public.has_role(requesting_user_id, 'superadmin') INTO is_superadmin;

  -- Return users based on hierarchy, ensuring each user appears only once
  RETURN QUERY
  SELECT DISTINCT ON (p.id) -- Use profile id instead of user_id
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.phone,
    p.company,
    -- Handle NULL user_id for invited users
    CASE 
      WHEN p.user_id IS NULL THEN 'user'::app_role
      ELSE COALESCE(public.get_user_role(p.user_id), 'user'::app_role) 
    END as app_role,
    -- Handle NULL user_id for invited users
    CASE 
      WHEN p.user_id IS NULL THEN ARRAY['user'::app_role]
      ELSE COALESCE(public.get_user_roles(p.user_id), ARRAY['user'::app_role]) 
    END as app_roles,
    -- Get the highest company role for this user (only for users with user_id)
    CASE
      WHEN p.user_id IS NULL THEN 'none'
      ELSE COALESCE(
        (SELECT cm_inner.role 
         FROM public.company_members cm_inner 
         WHERE cm_inner.user_id = p.user_id 
         AND cm_inner.status = 'active'
         ORDER BY 
           CASE cm_inner.role
             WHEN 'owner' THEN 1
             WHEN 'admin' THEN 2
             WHEN 'member' THEN 3
             ELSE 4
           END
         LIMIT 1), 
        'none'
      )
    END as company_role,
    p.status,
    p.created_at,
    -- Can manage roles if requesting user has higher level
    CASE 
      WHEN p.user_id IS NULL THEN is_superadmin -- Only superadmins can manage invited users
      ELSE (requesting_user_level > public.get_user_highest_role_level(p.user_id))
    END as can_manage_roles,
    -- Only superadmins can assign to companies
    is_superadmin as can_assign_to_companies
  FROM public.profiles p
  LEFT JOIN public.company_members cm ON p.user_id = cm.user_id AND cm.status = 'active'
  WHERE 
    -- Superadmins can see everyone including invited users
    (is_superadmin) 
    OR 
    -- Company owners can see their company members (excluding invited users for now)
    (p.user_id IS NOT NULL AND p.user_id IN (
      SELECT cm2.user_id 
      FROM public.company_members cm2 
      JOIN public.company_members requesting_cm ON cm2.company_id = requesting_cm.company_id
      WHERE requesting_cm.user_id = requesting_user_id 
      AND requesting_cm.role = 'owner' 
      AND requesting_cm.status = 'active'
      AND cm2.status = 'active'
    ))
  ORDER BY p.id, p.created_at DESC;
END;
$$;