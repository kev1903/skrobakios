-- Security Fix 1: Drop and recreate use_access_token function with proper security
DROP FUNCTION IF EXISTS public.use_access_token(text);

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

  -- Check for rate limiting (max 5 attempts per minute per token)
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

-- Security Fix 2: Add missing columns to user_access_tokens
ALTER TABLE user_access_tokens 
ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- Security Fix 3: Properly handle policy recreation
DROP POLICY IF EXISTS "Public companies are viewable by everyone" ON companies;
DROP POLICY IF EXISTS "Public companies are viewable by authenticated users" ON companies;

CREATE POLICY "Public companies are viewable by authenticated users" ON companies
FOR SELECT
TO authenticated
USING (public_page = true AND verified = true);

-- Security Fix 4: Add JSON validation function
CREATE OR REPLACE FUNCTION validate_json_fields()
RETURNS TRIGGER AS $$
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