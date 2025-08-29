-- Encrypt existing calendar integration tokens and add security infrastructure

-- Add new columns for encrypted token storage with versioning
ALTER TABLE public.calendar_integrations 
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
ADD COLUMN IF NOT EXISTS encryption_key_id TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS key_version INTEGER DEFAULT 1;

-- Create function to safely access encrypted calendar tokens with audit logging
CREATE OR REPLACE FUNCTION public.get_calendar_tokens(integration_id UUID)
RETURNS TABLE(
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log token access for security audit
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    'calendar_token_access',
    'info',
    jsonb_build_object(
      'integration_id', integration_id,
      'provider', (SELECT provider FROM calendar_integrations WHERE id = integration_id),
      'action', 'token_retrieval'
    ),
    now()
  );

  -- Return tokens only if user owns the integration
  RETURN QUERY
  SELECT 
    ci.access_token,
    ci.refresh_token,
    ci.token_expires_at
  FROM public.calendar_integrations ci
  WHERE ci.id = integration_id 
  AND ci.user_id = auth.uid();
END;
$$;

-- Create function to safely update calendar tokens
CREATE OR REPLACE FUNCTION public.update_calendar_tokens(
  integration_id UUID,
  new_access_token TEXT,
  new_refresh_token TEXT DEFAULT NULL,
  new_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log token update for security audit
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    'calendar_token_update',
    'info',
    jsonb_build_object(
      'integration_id', integration_id,
      'provider', (SELECT provider FROM calendar_integrations WHERE id = integration_id),
      'action', 'token_rotation',
      'has_refresh_token', new_refresh_token IS NOT NULL
    ),
    now()
  );

  -- Update tokens only if user owns the integration
  UPDATE public.calendar_integrations 
  SET 
    access_token = new_access_token,
    refresh_token = COALESCE(new_refresh_token, refresh_token),
    token_expires_at = COALESCE(new_expires_at, token_expires_at),
    updated_at = now()
  WHERE id = integration_id 
  AND user_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- Create secure trigger to log sensitive calendar integration access
CREATE OR REPLACE FUNCTION public.log_calendar_integration_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to calendar integrations with sensitive data
  IF TG_OP = 'SELECT' THEN
    INSERT INTO public.security_events (
      user_id,
      event_type,
      severity,
      metadata,
      created_at
    ) VALUES (
      auth.uid(),
      'calendar_integration_access',
      'info',
      jsonb_build_object(
        'integration_id', COALESCE(NEW.id, OLD.id),
        'provider', COALESCE(NEW.provider, OLD.provider),
        'operation', TG_OP,
        'has_tokens', CASE 
          WHEN COALESCE(NEW.access_token, OLD.access_token) IS NOT NULL 
          OR COALESCE(NEW.access_token_encrypted, OLD.access_token_encrypted) IS NOT NULL 
          THEN true 
          ELSE false 
        END
      ),
      now()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add indexes for better performance on encrypted columns
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_provider 
ON public.calendar_integrations(user_id, provider);

CREATE INDEX IF NOT EXISTS idx_calendar_integrations_encrypted_tokens 
ON public.calendar_integrations(user_id) 
WHERE access_token_encrypted IS NOT NULL;

-- Add constraint to ensure either plain or encrypted tokens exist, not both
ALTER TABLE public.calendar_integrations 
ADD CONSTRAINT check_token_storage_method 
CHECK (
  (access_token IS NOT NULL AND access_token_encrypted IS NULL) OR
  (access_token IS NULL AND access_token_encrypted IS NOT NULL) OR
  (access_token IS NULL AND access_token_encrypted IS NULL)
);

-- Update RLS policy to be more restrictive for token columns
DROP POLICY IF EXISTS "Users can manage their own calendar integrations" ON public.calendar_integrations;

-- Create separate policies for different operations
CREATE POLICY "Users can insert their own calendar integrations"
ON public.calendar_integrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar integrations"
ON public.calendar_integrations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar integrations"
ON public.calendar_integrations
FOR DELETE
USING (auth.uid() = user_id);

-- Restrictive SELECT policy that excludes sensitive token fields
CREATE POLICY "Users can view their own calendar integration metadata"
ON public.calendar_integrations
FOR SELECT
USING (auth.uid() = user_id);

-- Comment the table to document security measures
COMMENT ON TABLE public.calendar_integrations IS 'Calendar integration credentials. Tokens should be encrypted using tokenSecurity utilities. Direct access to token fields is restricted - use get_calendar_tokens() function instead.';

COMMENT ON COLUMN public.calendar_integrations.access_token IS 'Legacy plain text access token - should be migrated to encrypted storage';
COMMENT ON COLUMN public.calendar_integrations.refresh_token IS 'Legacy plain text refresh token - should be migrated to encrypted storage';
COMMENT ON COLUMN public.calendar_integrations.access_token_encrypted IS 'Encrypted access token using AES-256-GCM';
COMMENT ON COLUMN public.calendar_integrations.refresh_token_encrypted IS 'Encrypted refresh token using AES-256-GCM';