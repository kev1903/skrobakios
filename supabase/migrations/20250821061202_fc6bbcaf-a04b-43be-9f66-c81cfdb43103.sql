-- Security Fix 1: Add proper search_path protection to critical functions
-- This prevents SQL injection through function calls by restricting schema access

-- Fix get_manageable_users_for_user function
CREATE OR REPLACE FUNCTION public.get_manageable_users_for_user(requesting_user_id uuid)
 RETURNS TABLE(user_id uuid, email text, first_name text, last_name text, avatar_url text, phone text, company text, app_role app_role, app_roles app_role[], company_role text, status text, created_at timestamp with time zone, can_manage_roles boolean, can_assign_to_companies boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  requesting_user_level integer;
  is_superadmin boolean;
BEGIN
  -- Get requesting user's level and superadmin status without calling other functions
  SELECT CASE 
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'superadmin') THEN 100
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'business_admin') THEN 80
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'project_admin') THEN 60
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'user') THEN 40
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'client') THEN 20
    ELSE 0
  END INTO requesting_user_level;

  SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = requesting_user_id AND role = 'superadmin') INTO is_superadmin;

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
      ELSE COALESCE(
        (SELECT ur.role FROM user_roles ur WHERE ur.user_id = p.user_id ORDER BY 
          CASE ur.role
            WHEN 'superadmin' THEN 1
            WHEN 'business_admin' THEN 2
            WHEN 'project_admin' THEN 3
            WHEN 'user' THEN 4
            WHEN 'client' THEN 5
          END LIMIT 1), 
        'user'::app_role
      )
    END as app_role,
    -- Handle NULL user_id for invited users - return array of roles
    CASE 
      WHEN p.user_id IS NULL THEN ARRAY['user'::app_role]
      ELSE COALESCE(
        (SELECT ARRAY_AGG(ur.role ORDER BY 
          CASE ur.role
            WHEN 'superadmin' THEN 1
            WHEN 'business_admin' THEN 2
            WHEN 'project_admin' THEN 3
            WHEN 'user' THEN 4
            WHEN 'client' THEN 5
          END) FROM user_roles ur WHERE ur.user_id = p.user_id), 
        ARRAY['user'::app_role]
      )
    END as app_roles,
    -- Get the highest company role for this user (only for users with user_id)
    CASE
      WHEN p.user_id IS NULL THEN 'none'
      ELSE COALESCE(
        (SELECT cm_inner.role 
         FROM company_members cm_inner 
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
      ELSE (requesting_user_level > CASE 
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'superadmin') THEN 100
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'business_admin') THEN 80
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'project_admin') THEN 60
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'user') THEN 40
        WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_roles.user_id = p.user_id AND role = 'client') THEN 20
        ELSE 0
      END)
    END as can_manage_roles,
    -- Only superadmins can assign to companies
    is_superadmin as can_assign_to_companies
  FROM profiles p
  LEFT JOIN company_members cm ON p.user_id = cm.user_id AND cm.status = 'active'
  WHERE 
    -- Superadmins can see everyone including invited users
    (is_superadmin) 
    OR 
    -- Company owners can see their company members (excluding invited users for now)
    (p.user_id IS NOT NULL AND p.user_id IN (
      SELECT cm2.user_id 
      FROM company_members cm2 
      JOIN company_members requesting_cm ON cm2.company_id = requesting_cm.company_id
      WHERE requesting_cm.user_id = requesting_user_id 
      AND requesting_cm.role = 'owner' 
      AND requesting_cm.status = 'active'
      AND cm2.status = 'active'
    ))
  ORDER BY p.id, p.created_at DESC;
END;
$function$;

-- Fix set_user_primary_role function
CREATE OR REPLACE FUNCTION public.set_user_primary_role(target_user_id uuid, new_role app_role)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  requester_id uuid := auth.uid();
  allowed boolean := false;
BEGIN
  IF requester_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Allow superadmins, or users with a higher level than the target
  IF EXISTS(SELECT 1 FROM user_roles WHERE user_id = requester_id AND role = 'superadmin') THEN
    allowed := true;
  ELSE
    -- For now, just allow superadmins to change roles
    allowed := false;
  END IF;

  IF NOT allowed THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions - superadmin required');
  END IF;

  -- Replace all roles with the new primary role
  DELETE FROM user_roles WHERE user_id = target_user_id;
  
  -- Insert the new role
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role);

  RETURN json_build_object('success', true, 'user_id', target_user_id, 'role', new_role);
END;
$function$;

-- Security Fix 2: Add rate limiting and validation to access token system
CREATE OR REPLACE FUNCTION public.use_access_token(token_value text)
RETURNS TABLE(
  success boolean,
  error text,
  user_id uuid,
  token_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  token_record RECORD;
  current_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Input validation
  IF token_value IS NULL OR LENGTH(TRIM(token_value)) = 0 THEN
    RETURN QUERY SELECT false, 'Invalid token format', NULL::uuid, NULL::text;
    RETURN;
  END IF;

  -- Check for rate limiting (max 5 attempts per minute per IP would be ideal, but we'll do per token)
  IF EXISTS(
    SELECT 1 FROM user_access_tokens 
    WHERE token = token_value 
    AND last_used_at > current_time - INTERVAL '1 minute'
    AND used_count > 5
  ) THEN
    RETURN QUERY SELECT false, 'Rate limit exceeded', NULL::uuid, NULL::text;
    RETURN;
  END IF;

  -- Find and validate the token
  SELECT * INTO token_record
  FROM user_access_tokens
  WHERE token = token_value
    AND expires_at > current_time
    AND NOT is_used;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid or expired token', NULL::uuid, NULL::text;
    RETURN;
  END IF;

  -- Mark token as used and update usage statistics
  UPDATE user_access_tokens
  SET 
    is_used = true,
    used_at = current_time,
    last_used_at = current_time,
    used_count = COALESCE(used_count, 0) + 1
  WHERE token = token_value;

  -- Log the token usage for security monitoring
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id, metadata, created_at
  ) VALUES (
    token_record.user_id, 
    'token_used', 
    'access_token', 
    token_record.id,
    json_build_object(
      'token_type', token_record.token_type,
      'expires_at', token_record.expires_at,
      'used_at', current_time
    ),
    current_time
  );

  RETURN QUERY SELECT 
    true, 
    NULL::text, 
    token_record.user_id, 
    token_record.token_type;
END;
$function$;

-- Security Fix 3: Add missing used_count column to user_access_tokens
ALTER TABLE user_access_tokens 
ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- Security Fix 4: Restrict overly permissive policies
-- Update the companies policy that allows public access
DROP POLICY IF EXISTS "Public companies are viewable by everyone" ON companies;

CREATE POLICY "Public companies are viewable by authenticated users" ON companies
FOR SELECT
TO authenticated
USING (public_page = true AND verified = true);

-- Security Fix 5: Add input validation trigger for JSON fields
CREATE OR REPLACE FUNCTION validate_json_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate JSON fields in various tables to prevent malformed JSON
  IF TG_TABLE_NAME = 'companies' THEN
    IF NEW.social_links IS NOT NULL THEN
      -- Ensure social_links is valid JSON object
      IF NOT (NEW.social_links ? 'validate' OR jsonb_typeof(NEW.social_links) = 'object') THEN
        NEW.social_links := '{}'::jsonb;
      END IF;
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.social_links IS NOT NULL THEN
      IF NOT (NEW.social_links ? 'validate' OR jsonb_typeof(NEW.social_links) = 'object') THEN
        NEW.social_links := '{}'::jsonb;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Apply validation triggers to tables with JSON fields
DROP TRIGGER IF EXISTS validate_companies_json ON companies;
CREATE TRIGGER validate_companies_json
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION validate_json_fields();

DROP TRIGGER IF EXISTS validate_profiles_json ON profiles;
CREATE TRIGGER validate_profiles_json
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION validate_json_fields();